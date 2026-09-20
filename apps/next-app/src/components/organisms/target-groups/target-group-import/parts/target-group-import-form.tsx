"use client";
import { Form, useFormikContext } from "formik";
import { FileUploader, FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ImportConfigValues } from "../types/import-types";
interface Props {
  disabled?: boolean;
}
export function TargetGroupImportForm({ disabled }: Props) {
  const t = useTranslation();
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    submitCount,
  } = useFormikContext<ImportConfigValues>();
  return (
    <Form id="target-group-import-form" className="grid gap-6">
      <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-[var(--np-ink)]">
          {t("targetGroups.importMode")}
        </legend>
        {(["insert", "upsert"] as const).map((value) => (
          <label
            key={value}
            className="flex cursor-pointer gap-3 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-4"
          >
            <input
              type="radio"
              className="accent-[var(--np-primary)]"
              name="target-import-mode"
              checked={values.mode === value}
              disabled={disabled}
              onChange={() => void setFieldValue("mode", value)}
            />
            <span>
              <strong className="block text-sm text-[var(--np-ink)]">
                {t(
                  value === "insert"
                    ? "targetGroups.importModeInsert"
                    : "targetGroups.importModeUpsert",
                )}
              </strong>
              <small className="text-[var(--np-muted)]">
                {t(
                  value === "insert"
                    ? "targetGroups.importModeInsertHint"
                    : "targetGroups.importModeUpsertHint",
                )}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      <FileUploader
        files={values.file ? [values.file] : []}
        onFilesChange={(files) => {
          void setFieldValue("file", files[0] ?? null);
          void setFieldTouched("file", true, false);
        }}
        accept=".csv,.xlsx,.xls"
        maxFileSize={10_000_000}
        maxFiles={1}
        disabled={disabled}
        label={t("targetGroups.importFile")}
        labels={{
          hint: "",
          choose: t("targetGroups.importFile"),
          upload: t("targetGroups.importStart"),
          uploading: t("targetGroups.importProgress"),
          complete: t("targetGroups.importComplete"),
          failed: t("targetGroups.importError"),
          remove: (name) => `${t("targetGroups.removeUser")}: ${name}`,
          type: () => t("targetGroups.fileInvalid"),
          size: () => t("targetGroups.fileTooLarge"),
          count: () => t("targetGroups.fileRequired"),
          summary: () => t("targetGroups.importFileHint"),
        }}
      />
      {(touched.file || submitCount > 0) && errors.file && (
        <FormMessage variant="error">{errors.file}</FormMessage>
      )}
    </Form>
  );
}
