"use client";

import type { FieldInputProps, FieldMetaProps } from "formik";
import { Field } from "formik";
import { FormField, Input } from "@next-phish/ui";

interface PageNameFieldProps {
  t: (key: string) => string;
}

export function PageNameField({ t }: PageNameFieldProps) {
  return (
    <section className="np-card p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Field name="name">
            {({
              field,
              meta,
            }: {
              field: FieldInputProps<string>;
              meta: FieldMetaProps<string>;
            }) => (
              <FormField
                label={t("pages.name")}
                id="name"
                required
                error={meta.touched ? meta.error : undefined}
              >
                {(control) => <Input {...control} {...field} />}
              </FormField>
            )}
          </Field>
        </div>
      </div>
    </section>
  );
}
