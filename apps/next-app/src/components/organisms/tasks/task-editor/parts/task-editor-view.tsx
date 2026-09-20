import type { ReactNode } from "react";
import { Button, Dialog, FormMessage } from "@next-phish/ui";
import { Trash2 } from "lucide-react";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

interface Props {
  taskTitle?: string;
  editing: boolean;
  busy: boolean;
  error: string;
  confirmingDelete: boolean;
  t: TranslationFunction;
  form: ReactNode;
  onClose: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}
export function TaskEditorView(props: Props) {
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => !open && props.onClose()}
        dismissible={!props.busy}
        title={props.t(props.editing ? "tasks.editTask" : "tasks.createTask")}
        description={props.t("tasks.taskFormHint")}
        closeLabel={props.t("settings.closeDialog")}
      >
        {props.editing && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="danger"
              disabled={props.busy}
              onClick={props.onAskDelete}
            >
              <Trash2 size={16} />
              {props.t("tasks.deleteTask")}
            </Button>
          </div>
        )}
        {props.form}
      </Dialog>
      {props.editing && props.confirmingDelete && (
        <Dialog
          open
          onOpenChange={(open) => !open && props.onCancelDelete()}
          dismissible={!props.busy}
          title={props.t("tasks.deleteConfirm")}
          description={props.t("tasks.deleteDescription")}
          closeLabel={props.t("settings.closeDialog")}
          footer={
            <>
              <Button
                variant="secondary"
                disabled={props.busy}
                onClick={props.onCancelDelete}
              >
                {props.t("tasks.cancel")}
              </Button>
              <Button
                variant="danger"
                loading={props.busy}
                onClick={props.onDelete}
              >
                {props.t("tasks.confirmDelete")}
              </Button>
            </>
          }
        >
          <p>{props.taskTitle}</p>
          {props.error && (
            <FormMessage variant="error">{props.error}</FormMessage>
          )}
        </Dialog>
      )}
    </>
  );
}
