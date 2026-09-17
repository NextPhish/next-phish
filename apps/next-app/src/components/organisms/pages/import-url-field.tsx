"use client";

import { ErrorMessage, Field } from "formik";
import type { FieldInputProps } from "formik";
import { FormField, Input } from "@next-phish/ui";

interface ImportUrlFieldProps {
  t: (key: string) => string;
}

export function ImportUrlField({ t }: ImportUrlFieldProps) {
  return (
    <div className="space-y-2">
      <Field name="url">
        {({ field }: { field: FieldInputProps<string> }) => (
          <FormField label={t("pages.urlLabel")} id="importUrl">
            {(control) => (
              <Input
                {...control}
                {...field}
                placeholder={t("pages.urlPlaceholder")}
              />
            )}
          </FormField>
        )}
      </Field>
      <ErrorMessage name="url" component="p" className="np-field-error" />
    </div>
  );
}
