"use client";

import { useState } from "react";
import Link from "next/link";
import { useTaskBoard } from "./hooks/use-task-board";
import { TasksView } from "./parts/tasks-view";
import { TaskEditor } from "./task-editor";
import { TaskStatusManager } from "./task-status-manager";

type Task = ReturnType<typeof useTaskBoard>["tasks"][number];
type EditorState = { task: Task | null; statusId: string } | null;

export function Tasks() {
  const board = useTaskBoard();
  const [editor, setEditor] = useState<EditorState>(null);
  const [statusesOpen, setStatusesOpen] = useState(false);
  const openEditor = (
    task: Task | null,
    statusId = board.statuses[0]?.id ?? "",
  ) => setEditor({ task, statusId });

  return (
    <>
      <TasksView
        linkComponent={Link}
        board={board}
        onCreate={(statusId) => openEditor(null, statusId)}
        onEdit={(task) => openEditor(task, task.statusId)}
        onManageStatuses={() => setStatusesOpen(true)}
      />
      {editor && (
        <TaskEditor
          board={board}
          task={editor.task}
          statusId={editor.statusId}
          onClose={() => setEditor(null)}
        />
      )}
      {statusesOpen && (
        <TaskStatusManager
          board={board}
          onClose={() => setStatusesOpen(false)}
        />
      )}
    </>
  );
}
