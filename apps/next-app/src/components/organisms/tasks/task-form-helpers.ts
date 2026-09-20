import { setIn } from "formik";
import {
  taskFormSchema,
  taskStatusFormSchema,
  type TaskFormValues,
} from "@next-phish/shared";
import type { useTaskBoard } from "./hooks/use-task-board";
import type { useTranslation } from "@/src/lib/i18n/client";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
type Task = ReturnType<typeof useTaskBoard>["tasks"][number];
export function taskInitialValues(
  task: Pick<
    Task,
    | "title"
    | "description"
    | "statusId"
    | "priority"
    | "assignee"
    | "dueAt"
    | "relation"
  > | null,
  statusId: string,
): TaskFormValues {
  let dueAt: string | null = null;
  if (task?.dueAt) {
    const date = new Date(task.dueAt);
    const pad = (value: number) => String(value).padStart(2, "0");
    dueAt = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return {
    title: task?.title ?? "",
    description: task?.description ?? null,
    statusId: task?.statusId ?? statusId,
    priority: task?.priority ?? "MEDIUM",
    assigneeId: task?.assignee?.id ?? null,
    dueAt,
    relation: task?.relation
      ? { type: task.relation.type, id: task.relation.id }
      : null,
  };
}
export function taskValidator(
  t: ReturnType<typeof useTranslation>,
  status = false,
) {
  const validate = toFormikValidation(
    status ? taskStatusFormSchema : taskFormSchema,
  );
  return (values: unknown) => {
    let errors = {};
    for (const field of Object.keys(validate(values))) {
      errors = setIn(
        errors,
        field,
        t(`tasks.validation.${field.split(".")[0]}`),
      );
    }
    return errors;
  };
}
