"use client";

import { Formik } from "formik";
import { useTargetGroupForm } from "./hooks/use-target-group-form";
import type { TargetGroupFormOptions } from "./types/form-options";
import { TargetGroupFormFields } from "./parts/target-group-form-fields";
import type { TargetGroupFormValues } from "./types/form-values";

export function TargetGroupForm(props: TargetGroupFormOptions) {
  const form = useTargetGroupForm(props);
  return (
    <Formik<TargetGroupFormValues>
      initialValues={form.initialValues}
      validate={form.validate}
      onSubmit={form.submit}
      enableReinitialize
    >
      <TargetGroupFormFields
        error={form.error}
        success={form.success}
        isEdit={form.isEdit}
        onCancel={form.onCancel}
      />
    </Formik>
  );
}
