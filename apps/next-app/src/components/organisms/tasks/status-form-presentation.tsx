"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import {
  Button,
  Checkbox,
  FormField,
  FormMessage,
  Input,
} from "@next-phish/ui";
import type { TaskStatusFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./task-forms.module.css";

export function StatusFormPresentation({
  onCancel,
  submitLabel,
  error,
}: {
  onCancel: () => void;
  submitLabel: string;
  error?: string;
}) {
  const {
    errors,
    isSubmitting,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<TaskStatusFormValues>();
  const t = useTranslation();

  return (
    <Form
      noValidate
      className={styles.form}
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="status-name"
        label={t("tasks.name")}
        error={touched.name ? errors.name : undefined}
        required
      >
        {(control) => (
          <Field name="name">
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

      <div className={styles.checkRow}>
        <Checkbox
          id="status-marks-done"
          name="marksTaskDone"
          checked={values.marksTaskDone}
          onCheckedChange={(checked) =>
            void setFieldValue("marksTaskDone", checked === true)
          }
          disabled={isSubmitting}
        />
        <div>
          <label htmlFor="status-marks-done">{t("tasks.marksDone")}</label>
          <p>{t("tasks.marksDoneHint")}</p>
        </div>
      </div>

      <FormField
        id="status-color"
        label={t("tasks.color")}
        error={touched.colorToken ? errors.colorToken : undefined}
        required
      >
        {(control) => (
          <div className={styles.colorField}>
            <Input
              {...control}
              name="colorToken"
              type="color"
              value={values.colorToken}
              onChange={(event) =>
                void setFieldValue("colorToken", event.currentTarget.value)
              }
              onBlur={() => void setFieldTouched("colorToken", true)}
              disabled={isSubmitting}
            />
            <span>{values.colorToken}</span>
          </div>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t("tasks.cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}
