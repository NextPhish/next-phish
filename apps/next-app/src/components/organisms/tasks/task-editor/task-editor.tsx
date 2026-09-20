"use client";

import { useRef, useState } from "react";
import { Formik } from "formik";
import type { BlockEditorHandle } from "@/src/components/molecules/block-editor";
import type { useTaskBoard } from "../hooks/use-task-board";
import { TaskFormView } from "./parts/task-form-view";
import { TaskEditorView } from "./parts/task-editor-view";
import { useTaskEditor } from "./hooks/use-task-editor";
import { taskInitialValues, taskValidator } from "../task-form-helpers";

type Board = ReturnType<typeof useTaskBoard>;
type Task = Board["tasks"][number];
interface Props {
  board: Board;
  task: Task | null;
  statusId: string;
  onClose: () => void;
}

export function TaskEditor({ board, task, statusId, onClose }: Props) {
  const editor = useTaskEditor(board, task, onClose);
  const descriptionEditor = useRef<BlockEditorHandle>(null);
  const [savingDescription, setSavingDescription] = useState(false);
  const close = savingDescription ? () => {} : editor.close;
  const form = (
    <Formik
      initialValues={taskInitialValues(task, statusId)}
      validate={taskValidator(editor.t)}
      onSubmit={async (values) => {
        setSavingDescription(true);
        try {
          const description = descriptionEditor.current
            ? await descriptionEditor.current.save()
            : values.description;
          await editor.submit({ ...values, description });
        } catch {
          editor.reportSaveFailure();
        } finally {
          setSavingDescription(false);
        }
      }}
    >
      <TaskFormView
        statuses={board.statuses}
        currentResource={
          task?.relation
            ? { id: task.relation.id, name: task.relation.name }
            : undefined
        }
        error={editor.error}
        onCancel={close}
        descriptionEditorRef={descriptionEditor}
      />
    </Formik>
  );
  return (
    <TaskEditorView
      taskTitle={task?.title}
      editing={Boolean(task)}
      busy={editor.busy || savingDescription}
      error={editor.error}
      confirmingDelete={editor.confirmingDelete}
      t={editor.t}
      form={form}
      onClose={close}
      onAskDelete={editor.askDelete}
      onCancelDelete={editor.cancelDelete}
      onDelete={editor.remove}
    />
  );
}
