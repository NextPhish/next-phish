"use client";
import { useState } from "react";
import { Formik, type FormikHelpers } from "formik";
import { Dialog, Button, FormMessage } from "@next-phish/ui";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import type { TaskStatusFormValues } from "@next-phish/shared";
import type { useTaskBoard } from "@/src/hooks/use-task-board";
import { useTranslation } from "@/src/lib/i18n/client";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { StatusFormPresentation } from "./status-form-presentation";
import { taskValidator } from "./task-form-values";
import styles from "./task-dialogs.module.css";
type Board = ReturnType<typeof useTaskBoard>;
const legacyColors: Record<string, string> = {
  neutral: "#64748b",
  blue: "#29b8ff",
  indigo: "#5c73ff",
  violet: "#7b5cff",
  cyan: "#15e5d4",
};
export function TaskStatusDialog({
  board,
  onClose,
}: {
  board: Board;
  onClose: () => void;
}) {
  const t = useTranslation();
  const [editing, setEditing] = useState<Board["statuses"][number] | null>(
    null,
  );
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
  return (
    <Dialog
      open
      dismissible={!busy}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
      title={t("tasks.manageTitle")}
      description={t("tasks.statusPermission")}
      closeLabel={t("settings.closeDialog")}
    >
      <div className={styles.statuses}>
        {board.statuses.map((item, index) => (
          <div key={item.id} className={styles.statusRow}>
            <span className={styles.statusName}>
              <span
                className={styles.dot}
                style={{
                  backgroundColor:
                    legacyColors[item.colorToken] ?? item.colorToken,
                }}
              />
              {item.name}
              <small>{item.taskCount ?? 0}</small>
            </span>
            <div className={styles.actions}>
              <Button
                variant="ghost"
                disabled={busy}
                aria-label={`${t("tasks.editStatus")} ${item.name}`}
                onClick={() => {
                  reset();
                  setEditing(item);
                }}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={busy || index === 0}
                aria-label={t("tasks.moveStatusEarlier", { name: item.name })}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={busy || index === board.statuses.length - 1}
                aria-label={t("tasks.moveStatusLater", { name: item.name })}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={
                  busy ||
                  (item.taskCount ?? 0) > 0 ||
                  board.statuses.length <= 1
                }
                aria-label={t("tasks.deleteStatus", { name: item.name })}
                onClick={() => remove(item.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {status.type === "error" && (
        <FormMessage variant="error">{status.message}</FormMessage>
      )}
      <h3 className={styles.formTitle}>
        {t(editing ? "tasks.editStatus" : "tasks.addStatus")}
      </h3>
      <Formik
        key={editing?.id ?? "new"}
        initialValues={
          editing
            ? {
                name: editing.name,
                marksTaskDone: editing.marksTaskDone,
                colorToken:
                  legacyColors[editing.colorToken] ?? editing.colorToken,
              }
            : { name: "", marksTaskDone: false, colorToken: "#64748b" }
        }
        validate={taskValidator(t, true)}
        onSubmit={submit}
      >
        <StatusFormPresentation
          submitLabel={t(editing ? "tasks.saveStatus" : "tasks.addStatus")}
          onCancel={() => {
            if (busy) return;
            reset();
            if (editing) setEditing(null);
            else onClose();
          }}
        />
      </Formik>
    </Dialog>
  );
}
