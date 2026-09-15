"use client";
import { useState } from "react";
import Link from "next/link";
import { Formik } from "formik";
import { Dialog, Button, FormMessage } from "@next-phish/ui";
import { Trash2 } from "lucide-react";
import type { TaskFormValues } from "@next-phish/shared";
import { useTaskBoard } from "@/src/hooks/use-task-board";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { TasksPresentation } from "./presentation";
import { TaskFormPresentation } from "./task-form-presentation";
import { TaskStatusDialog } from "./task-status-dialog";
import { taskInitialValues, taskValidator } from "./task-form-values";
type Task = ReturnType<typeof useTaskBoard>["tasks"][number];
type DialogState =
  | { type: "closed" }
  | {
      type: "task";
      task: Task | null;
      statusId: string;
      confirmingDelete?: boolean;
    };
export function TasksContainer() {
  const t = useTranslation();
  const board = useTaskBoard();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [statusesOpen, setStatusesOpen] = useState(false);
  const { status, setError, reset } = useFormStatus();
  const busy =
    board.create.isPending || board.update.isPending || board.remove.isPending;
  const error = status.type === "error" ? status.message : "";
  function close() {
    if (!busy) {
      setDialog({ type: "closed" });
      reset();
    }
  }
  function openTask(task: Task | null, statusId = board.statuses[0]?.id ?? "") {
    reset();
    setDialog({ type: "task", task, statusId });
  }
  async function submitTask(values: TaskFormValues) {
    if (dialog.type !== "task") return;
    reset();
    try {
      const input = {
        ...values,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        relation:
          values.relation?.type && values.relation.id ? values.relation : null,
      };
      if (dialog.task)
        await board.update.mutateAsync({ id: dialog.task.id, ...input });
      else await board.create.mutateAsync(input);
      setDialog({ type: "closed" });
    } catch {
      setError(t("tasks.saveFailed"));
    }
  }
  async function deleteTask() {
    if (dialog.type !== "task" || !dialog.task) return;
    reset();
    try {
      await board.remove.mutateAsync({ id: dialog.task.id });
      setDialog({ type: "closed" });
    } catch {
      setError(t("tasks.deleteFailed"));
    }
  }
  function cancelDelete() {
    if (!busy && dialog.type === "task") {
      reset();
      setDialog({ ...dialog, confirmingDelete: false });
    }
  }
  return (
    <>
      <TasksPresentation
        linkComponent={Link}
        board={board}
        onCreate={(statusId) => openTask(null, statusId)}
        onEdit={(task) => openTask(task, task.statusId)}
        onManageStatuses={() => setStatusesOpen(true)}
      />
      {dialog.type === "task" && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) close();
          }}
          dismissible={!busy}
          title={t(dialog.task ? "tasks.editTask" : "tasks.createTask")}
          description={t("tasks.taskFormHint")}
          closeLabel={t("settings.closeDialog")}
        >
          {dialog.task && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 16,
              }}
            >
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => {
                  reset();
                  setDialog({ ...dialog, confirmingDelete: true });
                }}
              >
                <Trash2 size={16} />
                {t("tasks.deleteTask")}
              </Button>
            </div>
          )}
          <Formik
            initialValues={taskInitialValues(dialog.task, dialog.statusId)}
            validate={taskValidator(t)}
            onSubmit={submitTask}
          >
            <TaskFormPresentation
              statuses={board.statuses}
              currentResource={
                dialog.task?.relation
                  ? {
                      id: dialog.task.relation.id,
                      name: dialog.task.relation.name,
                    }
                  : undefined
              }
              error={error}
              onCancel={close}
            />
          </Formik>
        </Dialog>
      )}
      {dialog.type === "task" && dialog.task && dialog.confirmingDelete && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) cancelDelete();
          }}
          dismissible={!busy}
          title={t("tasks.deleteConfirm")}
          description={t("tasks.deleteDescription")}
          closeLabel={t("settings.closeDialog")}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={cancelDelete}
              >
                {t("tasks.cancel")}
              </Button>
              <Button variant="danger" loading={busy} onClick={deleteTask}>
                {t("tasks.confirmDelete")}
              </Button>
            </>
          }
        >
          <p>{dialog.task.title}</p>
          {error && <FormMessage variant="error">{error}</FormMessage>}
        </Dialog>
      )}
      {statusesOpen && (
        <TaskStatusDialog
          board={board}
          onClose={() => setStatusesOpen(false)}
        />
      )}
    </>
  );
}
