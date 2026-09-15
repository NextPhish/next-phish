"use client";

import { useEffect, useRef, useState } from "react";
import { getIn, useFormikContext } from "formik";
import { Autocomplete, FormField, Select } from "@next-phish/ui";
import type { TaskFormValues, TaskResourceType } from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";
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

  const campaign = trpc.campaign.list.useQuery(
    { search: search || undefined, limit: 20, offset: 0 },
    { enabled: type === "CAMPAIGN" },
  );
  const schedule = trpc.campaign.listSchedules.useQuery(
    { search: search || undefined, limit: 20, offset: 0 },
    { enabled: type === "SCHEDULE" },
  );
  const page = trpc.page.list.useQuery(
    {
      search: search || undefined,
      selectedId: type === "PAGE" ? values.relation?.id : undefined,
      includeContent: false,
      limit: 20,
      offset: 0,
    },
    { enabled: type === "PAGE" },
  );
  const emailTemplate = trpc.emailTemplate.list.useQuery(
    {
      search: search || undefined,
      selectedId: type === "EMAIL_TEMPLATE" ? values.relation?.id : undefined,
      includeContent: false,
      limit: 20,
      offset: 0,
    },
    { enabled: type === "EMAIL_TEMPLATE" },
  );
  const targetGroup = trpc.targetGroup.list.useQuery(
    { search: search || undefined, limit: 20, offset: 0 },
    { enabled: type === "TARGET_GROUP" },
  );
  const sendingProfile = trpc.mailSending.list.useQuery(
    { search: search || undefined, limit: 20, offset: 0 },
    { enabled: type === "SENDING_PROFILE" },
  );

  const byType: Partial<Record<TaskResourceType, ResourceOption[]>> = {
    CAMPAIGN: campaign.data?.rows ?? [],
    SCHEDULE: schedule.data?.rows ?? [],
    PAGE: page.data?.pages ?? [],
    EMAIL_TEMPLATE: emailTemplate.data?.emailTemplates ?? [],
    TARGET_GROUP: targetGroup.data?.targetGroups ?? [],
    SENDING_PROFILE: sendingProfile.data?.profiles ?? [],
  };
  const queries = {
    CAMPAIGN: campaign,
    SCHEDULE: schedule,
    PAGE: page,
    EMAIL_TEMPLATE: emailTemplate,
    TARGET_GROUP: targetGroup,
    SENDING_PROFILE: sendingProfile,
  };
  const activeQuery = type ? queries[type] : undefined;
  const loading = activeQuery?.isLoading ?? false;
  const options = type ? [...(byType[type] ?? [])] : [];
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
            activeQuery?.error ? t("tasks.resourcesFailed") : relationError
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
              loading={loading}
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
