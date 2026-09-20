"use client";

import { Formik } from "formik";
import type { useTaskBoard } from "../hooks/use-task-board";
import { StatusFormView } from "./parts/status-form-view";
import { TaskStatusManagerView } from "./parts/task-status-manager-view";
import { useTaskStatusManager } from "./hooks/use-task-status-manager";
import { taskValidator } from "../task-form-helpers";

type Board = ReturnType<typeof useTaskBoard>;
const legacyColors: Record<string, string> = {
  neutral: "#64748b",
  blue: "#29b8ff",
  indigo: "#5c73ff",
  violet: "#7b5cff",
  cyan: "#15e5d4",
};
export function TaskStatusManager({
  board,
  onClose,
}: {
  board: Board;
  onClose: () => void;
}) {
  const manager = useTaskStatusManager(board, onClose);
  const form = (
    <Formik
      key={manager.editing?.id ?? "new"}
      initialValues={
        manager.editing
          ? {
              name: manager.editing.name,
              marksTaskDone: manager.editing.marksTaskDone,
              colorToken:
                legacyColors[manager.editing.colorToken] ??
                manager.editing.colorToken,
            }
          : { name: "", marksTaskDone: false, colorToken: "#64748b" }
      }
      validate={taskValidator(manager.t, true)}
      onSubmit={manager.submit}
    >
      <StatusFormView
        submitLabel={manager.t(
          manager.editing ? "tasks.saveStatus" : "tasks.addStatus",
        )}
        onCancel={manager.cancel}
      />
    </Formik>
  );
  return (
    <TaskStatusManagerView
      statuses={board.statuses}
      busy={manager.busy}
      error={manager.error}
      editing={Boolean(manager.editing)}
      t={manager.t}
      form={form}
      onClose={manager.close}
      onEdit={manager.edit}
      onMove={manager.move}
      onRemove={manager.remove}
    />
  );
}
