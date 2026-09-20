"use client";

import {
  Field,
  Form,
  getIn,
  useFormikContext,
  type FieldInputProps,
} from "formik";
import type { RefObject } from "react";
import {
  Button,
  DateTimePicker,
  FormField,
  FormMessage,
  Input,
  Select,
} from "@next-phish/ui";
import type { TaskFormValues } from "@next-phish/shared";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { TaskResourcePicker } from "./task-resource-picker";
import {
  BlockEditor,
  type BlockEditorHandle,
} from "@/src/components/molecules/block-editor";
import styles from "../../task-forms.module.css";

interface Props {
  statuses: Array<{ id: string; name: string }>;
  currentResource?: { id: string; name: string };
  error?: string;
  onCancel: () => void;
  descriptionEditorRef: RefObject<BlockEditorHandle | null>;
}

export function TaskFormView({
  statuses,
  currentResource,
  error,
  onCancel,
  descriptionEditorRef,
}: Props) {
  const {
    errors,
    isSubmitting,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<TaskFormValues>();
  const t = useTranslation();
  const locale = useLocale();
  const fieldError = (name: string) =>
    getIn(touched, name)
      ? (getIn(errors, name) as string | undefined)
      : undefined;

  return (
    <Form
      noValidate
      className={styles.form}
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="task-title"
        label={t("tasks.titleField")}
        error={fieldError("title")}
        required
      >
        {(control) => (
          <Field name="title">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...control}
                {...field}
                disabled={isSubmitting}
                autoFocus
              />
            )}
          </Field>
        )}
      </FormField>

      <FormField
        id="task-description"
        label={t("tasks.description")}
        error={fieldError("description")}
      >
        {(control) => (
          <BlockEditor
            ref={descriptionEditorRef}
            id={control.id}
            label={t("tasks.description")}
            value={values.description}
            locale={locale}
            describedBy={control["aria-describedby"]}
            invalid={Boolean(control["aria-invalid"])}
            onChange={(description) =>
              void setFieldValue("description", description)
            }
            onBlur={() => void setFieldTouched("description", true)}
            disabled={isSubmitting}
          />
        )}
      </FormField>

      <div className={styles.grid}>
        <FormField
          id="task-status"
          label={t("tasks.status")}
          error={fieldError("statusId")}
          required
        >
          {(control) => (
            <Select
              {...control}
              options={statuses.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              value={values.statusId}
              onValueChange={(value) => void setFieldValue("statusId", value)}
              onBlur={() => void setFieldTouched("statusId", true)}
              disabled={isSubmitting}
            />
          )}
        </FormField>
        <FormField
          id="task-priority"
          label={t("tasks.priority")}
          error={fieldError("priority")}
          required
        >
          {(control) => (
            <Select
              {...control}
              options={[
                { label: t("tasks.low"), value: "LOW" },
                { label: t("tasks.medium"), value: "MEDIUM" },
                { label: t("tasks.high"), value: "HIGH" },
              ]}
              value={values.priority}
              onValueChange={(value) => void setFieldValue("priority", value)}
              onBlur={() => void setFieldTouched("priority", true)}
              disabled={isSubmitting}
            />
          )}
        </FormField>
      </div>

      <FormField
        id="task-due"
        label={t("tasks.dueDate")}
        error={fieldError("dueAt")}
      >
        {(control) => (
          <DateTimePicker
            {...control}
            value={values.dueAt ?? ""}
            locale={locale}
            onValueChange={(value) =>
              void setFieldValue("dueAt", value || null)
            }
            onBlur={() => void setFieldTouched("dueAt", true)}
            disabled={isSubmitting}
          />
        )}
      </FormField>

      <TaskResourcePicker currentResource={currentResource} />
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t("tasks.cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {t("tasks.saveTask")}
        </Button>
      </div>
    </Form>
  );
}
