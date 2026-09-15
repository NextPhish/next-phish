"use client";

import {
  Field,
  Form,
  getIn,
  useFormikContext,
  type FieldInputProps,
} from "formik";
import { Editor } from "primereact/editor";
import { Button, FormField, FormMessage, Input, Select } from "@next-phish/ui";
import type { TaskFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import { TaskResourcePicker } from "./task-resource-picker";
import styles from "./task-forms.module.css";

interface Props {
  statuses: Array<{ id: string; name: string }>;
  currentResource?: { id: string; name: string };
  error?: string;
  onCancel: () => void;
}

export function TaskFormPresentation({
  statuses,
  currentResource,
  error,
  onCancel,
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
          <div
            className={styles.richEditor}
            aria-describedby={control["aria-describedby"]}
            data-invalid={control["aria-invalid"] ? "true" : undefined}
          >
            <Editor
              id={control.id}
              value={values.description}
              headerTemplate={
                <span className="ql-formats">
                  <button
                    type="button"
                    className="ql-bold"
                    aria-label={t("tasks.formatBold")}
                    title={t("tasks.formatBold")}
                  />
                  <button
                    type="button"
                    className="ql-italic"
                    aria-label={t("tasks.formatItalic")}
                    title={t("tasks.formatItalic")}
                  />
                  <button
                    type="button"
                    className="ql-list"
                    value="ordered"
                    aria-label={t("tasks.formatOrderedList")}
                    title={t("tasks.formatOrderedList")}
                  />
                  <button
                    type="button"
                    className="ql-list"
                    value="bullet"
                    aria-label={t("tasks.formatBulletList")}
                    title={t("tasks.formatBulletList")}
                  />
                  <button
                    type="button"
                    className="ql-link"
                    aria-label={t("tasks.formatLink")}
                    title={t("tasks.formatLink")}
                  />
                  <button
                    type="button"
                    className="ql-clean"
                    aria-label={t("tasks.clearFormatting")}
                    title={t("tasks.clearFormatting")}
                  />
                </span>
              }
              onTextChange={(event) =>
                void setFieldValue("description", event.htmlValue ?? "")
              }
              onBlur={() => void setFieldTouched("description", true)}
              readOnly={isSubmitting}
              style={{ height: "9rem" }}
            />
          </div>
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
          <Input
            {...control}
            name="dueAt"
            type="datetime-local"
            value={values.dueAt ?? ""}
            onChange={(event) =>
              void setFieldValue("dueAt", event.currentTarget.value || null)
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
