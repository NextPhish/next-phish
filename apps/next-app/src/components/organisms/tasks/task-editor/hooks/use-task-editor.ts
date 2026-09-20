import { useState } from "react";
import type { TaskFormValues } from "@next-phish/shared";
import type { useTaskBoard } from "../../hooks/use-task-board";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";

type Board = ReturnType<typeof useTaskBoard>;
type Task = Board["tasks"][number];

export function useTaskEditor(
  board: Board,
  task: Task | null,
  onClose: () => void,
) {
  const t = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { status, setError, reset } = useFormStatus();
  const busy =
    board.create.isPending || board.update.isPending || board.remove.isPending;
  const error = status.type === "error" ? status.message : "";
  const close = () => {
    if (!busy) {
      reset();
      onClose();
    }
  };
  const cancelDelete = () => {
    if (!busy) {
      reset();
      setConfirmingDelete(false);
    }
  };

  async function submit(values: TaskFormValues) {
    reset();
    try {
      const input = {
        ...values,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
        relation:
          values.relation?.type && values.relation.id ? values.relation : null,
      };
      if (task) await board.update.mutateAsync({ id: task.id, ...input });
      else await board.create.mutateAsync(input);
      onClose();
    } catch {
      setError(t("tasks.saveFailed"));
    }
  }
  async function remove() {
    if (!task) return;
    reset();
    try {
      await board.remove.mutateAsync({ id: task.id });
      onClose();
    } catch {
      setError(t("tasks.deleteFailed"));
    }
  }
  return {
    t,
    busy,
    error,
    confirmingDelete,
    close,
    submit,
    remove,
    cancelDelete,
    askDelete: () => {
      reset();
      setConfirmingDelete(true);
    },
    reportSaveFailure: () => setError(t("tasks.saveFailed")),
  };
}
