"use client";
import { Form, useFormikContext } from "formik";
import { Button, FormErrorSummary, FormMessage } from "@next-phish/ui";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import { ScheduleFormSections } from "./schedule-form-sections";
import styles from "./schedule-form.module.css";
interface Props {
  error: string;
  campaigns: Array<{ id: string; name: string; type: "TEMPLATE" | "CONCRETE" }>;
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
  onCancel: () => void;
}
export function ScheduleFormPresentation({
  error,
  campaigns,
  targetGroups,
  onCancel,
}: Props) {
  const formik = useFormikContext<ScheduleFormValues>();
  const t = useTranslation();
  return (
    <Form
      noValidate
      className={styles.form}
      aria-busy={formik.isSubmitting || undefined}
    >
      <ScheduleFormSections campaigns={campaigns} targetGroups={targetGroups} />
      {formik.submitCount > 0 && Object.keys(formik.errors).length ? (
        <FormErrorSummary
          title={t("scheduleUi.validation.summary")}
          errors={Object.entries(formik.errors)
            .filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            )
            .map(([id, message]) => ({
              id: `schedule-${id.replaceAll(".", "-")}`,
              message,
            }))}
        />
      ) : null}
      {error ? <FormMessage variant="error">{error}</FormMessage> : null}
      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={formik.isSubmitting}
        >
          {t("scheduleUi.cancel")}
        </Button>
        <Button type="submit" loading={formik.isSubmitting}>
          {t("scheduleUi.save")}
        </Button>
      </div>
    </Form>
  );
}
