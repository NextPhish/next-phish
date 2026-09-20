"use client";

import { usePageSettings } from "./hooks/use-page-settings";
import { PageSettingsView } from "./parts/page-settings-view";
import type { PageSettingsValues } from "./types/page-settings.types";

interface Props {
  pageId?: string;
  values: PageSettingsValues;
  setFieldValue: (
    field: string,
    value: string | boolean | null,
    shouldValidate?: boolean,
  ) => Promise<unknown>;
  t: (key: string) => string;
}

export function PageSettings({ pageId, values, setFieldValue, t }: Props) {
  const settings = usePageSettings({ pageId, values });
  return (
    <PageSettingsView
      pageId={pageId}
      values={values}
      setFieldValue={setFieldValue}
      t={t}
      {...settings}
    />
  );
}
