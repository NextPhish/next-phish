"use client";

import { useEffect, useRef, useState } from "react";
import { getIn, useFormikContext } from "formik";
import { Autocomplete, FormField, Select } from "@next-phish/ui";
import type { TaskFormValues } from "@next-phish/shared";
import { useTaskResourceOptions } from "@/src/hooks/use-task-resource-options";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./task-forms.module.css";

interface ResourceOption {
  id: string;
  name: string;
}

export function TaskResourcePicker({
  currentResource,
}: {
  currentResource?: ResourceOption;
}) {
  const t = useTranslation();
  const {
    errors,
    isSubmitting,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<TaskFormValues>();
  const type = values.relation?.type;
  const [search, setSearch] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const resourceOptions = useTaskResourceOptions(
    type,
    values.relation?.id,
    search,
  );
  const options = [...resourceOptions.options];
  if (
    currentResource &&
    values.relation?.id === currentResource.id &&
    !options.some(({ id }) => id === currentResource.id)
  ) {
    options.unshift(currentResource);
  }

  const relationError = getIn(touched, "relation.id")
    ? (getIn(errors, "relation.id") as string | undefined)
    : undefined;
  const changeSearch = (query: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSearch(query), 300);
  };

  return (
    <div className={styles.grid}>
      <FormField id="task-relation-type" label={t("tasks.relatedType")}>
        {(control) => (
          <Select
            {...control}
            value={type ?? "NONE"}
            options={[
              { label: t("tasks.none"), value: "NONE" },
              { label: t("tasks.campaign"), value: "CAMPAIGN" },
              { label: t("tasks.schedule"), value: "SCHEDULE" },
              { label: t("tasks.page"), value: "PAGE" },
              { label: t("tasks.emailTemplate"), value: "EMAIL_TEMPLATE" },
              { label: t("tasks.targetGroup"), value: "TARGET_GROUP" },
              { label: t("tasks.sendingProfile"), value: "SENDING_PROFILE" },
            ]}
            onValueChange={(value) => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setSearch("");
              void setFieldValue(
                "relation",
                value === "NONE" ? null : { type: value, id: "" },
              );
            }}
            onBlur={() => void setFieldTouched("relation.type", true)}
            disabled={isSubmitting}
          />
        )}
      </FormField>
      {type ? (
        <FormField
          id="task-relation-id"
          label={t("tasks.relatedResource")}
          error={
            resourceOptions.error ? t("tasks.resourcesFailed") : relationError
          }
          required
        >
          {(control) => (
            <Autocomplete
              {...control}
              name="relation.id"
              value={values.relation?.id ?? ""}
              options={options.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              filterMode="server"
              onSearchChange={changeSearch}
              onValueChange={(id) =>
                void setFieldValue("relation", { type, id })
              }
              onBlur={() => void setFieldTouched("relation.id", true)}
              placeholder={t("tasks.searchResource")}
              loading={resourceOptions.loading}
              loadingLabel={t("common.loading")}
              emptyLabel={t("tasks.noResources")}
              listLabel={t("tasks.relatedResource")}
              disabled={isSubmitting}
            />
          )}
        </FormField>
      ) : (
        <div aria-hidden="true" />
      )}
    </div>
  );
}
