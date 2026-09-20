import { useState } from "react";
import type { FormikHelpers } from "formik";
import type { TaskStatusFormValues } from "@next-phish/shared";
import type { useTaskBoard } from "../../hooks/use-task-board";
import { useTranslation } from "@/src/lib/i18n/client";
import { useFormStatus } from "@/src/hooks/use-form-status";

type Board = ReturnType<typeof useTaskBoard>;
type Status = Board["statuses"][number];

export function useTaskStatusManager(board: Board, onClose: () => void) {
  const t = useTranslation();
  const [editing, setEditing] = useState<Status | null>(null);
  const { status, setError, reset } = useFormStatus();
  const busy =
    board.createStatus.isPending ||
    board.updateStatus.isPending ||
    board.reorderStatuses.isPending ||
    board.deleteStatus.isPending;
  async function submit(
    values: TaskStatusFormValues,
    helpers: FormikHelpers<TaskStatusFormValues>,
  ) {
    reset();
    try {
      if (editing)
        await board.updateStatus.mutateAsync({ id: editing.id, ...values });
      else await board.createStatus.mutateAsync(values);
      setEditing(null);
      helpers.resetForm();
    } catch {
      setError(t("tasks.statusSaveFailed"));
    }
  }
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= board.statuses.length) return;
    const ids = board.statuses.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reset();
    try {
      await board.reorderStatuses.mutateAsync({ statusIds: ids });
    } catch {
      setError(t("tasks.statusSaveFailed"));
    }
  }
  async function remove(id: string) {
    reset();
    try {
      await board.deleteStatus.mutateAsync({ id });
      if (editing?.id === id) setEditing(null);
    } catch {
      setError(t("tasks.statusDeleteFailed"));
    }
  }
  const cancel = () => {
    if (!busy) {
      reset();
      if (editing) setEditing(null);
      else onClose();
    }
  };
  return {
    t,
    editing,
    busy,
    error: status.type === "error" ? status.message : "",
    submit,
    move,
    remove,
    cancel,
    close: () => {
      if (!busy) onClose();
    },
    edit: (item: Status) => {
      reset();
      setEditing(item);
    },
  };
}
