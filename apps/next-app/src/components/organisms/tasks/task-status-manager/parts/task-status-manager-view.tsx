import type { ReactNode } from "react";
import { Dialog, Button, FormMessage } from "@next-phish/ui";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

const legacyColors: Record<string, string> = {
  neutral: "#64748b",
  blue: "#29b8ff",
  indigo: "#5c73ff",
  violet: "#7b5cff",
  cyan: "#15e5d4",
};
interface Status {
  id: string;
  organizationId: string;
  name: string;
  colorToken: string;
  marksTaskDone: boolean;
  position: number;
  taskCount?: number;
}
interface Props {
  statuses: Status[];
  busy: boolean;
  error: string;
  editing: boolean;
  t: TranslationFunction;
  form: ReactNode;
  onClose: () => void;
  onEdit: (status: Status) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}
export function TaskStatusManagerView(props: Props) {
  return (
    <Dialog
      open
      dismissible={!props.busy}
      onOpenChange={(open) => !open && props.onClose()}
      title={props.t("tasks.manageTitle")}
      description={props.t("tasks.statusPermission")}
      closeLabel={props.t("settings.closeDialog")}
    >
      <div className="mb-6 grid gap-2">
        {props.statuses.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2.5"
          >
            <span className="flex min-w-[120px] flex-1 items-center gap-2 [overflow-wrap:anywhere] [&_small]:text-[var(--np-muted)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    legacyColors[item.colorToken] ?? item.colorToken,
                }}
              />
              {item.name}
              <small>{item.taskCount ?? 0}</small>
            </span>
            <div className="flex gap-0.5 [&_button]:min-w-8 [&_button]:p-1.5">
              <Button
                variant="ghost"
                disabled={props.busy}
                aria-label={`${props.t("tasks.editStatus")} ${item.name}`}
                onClick={() => props.onEdit(item)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={props.busy || index === 0}
                aria-label={props.t("tasks.moveStatusEarlier", {
                  name: item.name,
                })}
                onClick={() => props.onMove(index, -1)}
              >
                <ArrowUp size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={props.busy || index === props.statuses.length - 1}
                aria-label={props.t("tasks.moveStatusLater", {
                  name: item.name,
                })}
                onClick={() => props.onMove(index, 1)}
              >
                <ArrowDown size={16} />
              </Button>
              <Button
                variant="ghost"
                disabled={
                  props.busy ||
                  (item.taskCount ?? 0) > 0 ||
                  props.statuses.length <= 1
                }
                aria-label={props.t("tasks.deleteStatus", { name: item.name })}
                onClick={() => props.onRemove(item.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {props.error && <FormMessage variant="error">{props.error}</FormMessage>}
      <h3 className="mb-4 mt-5 text-base font-semibold">
        {props.t(props.editing ? "tasks.editStatus" : "tasks.addStatus")}
      </h3>
      {props.form}
    </Dialog>
  );
}
