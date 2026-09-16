"use client";

import { getIn, useFormikContext } from "formik";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";

export function useScheduleFormFields() {
  const f = useFormikContext<ScheduleFormValues>();
  const t = useTranslation();
  const error = (name: string) =>
    getIn(f.touched, name)
      ? (getIn(f.errors, name) as string | undefined)
      : undefined;
  const setNumber = (name: string, value: string) =>
    void f.setFieldValue(name, value === "" ? null : Number(value));
  return { f, t, error, setNumber };
}
