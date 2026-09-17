"use client";

import { useFormikContext } from "formik";
import type { CampaignFormValues } from "@next-phish/shared";
import {
  Autocomplete,
  Checkbox,
  FormField,
  Input,
  Select,
  TagInput,
} from "@next-phish/ui";
import styles from "./campaign-form.module.css";
import { useTranslation } from "@/src/lib/i18n/client";

interface GeneralTabProps {
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
  isEdit: boolean;
}
const timezones = (() => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
})();
export function GeneralTab({ targetGroups, isEdit }: GeneralTabProps) {
  const t = useTranslation();
  const formik = useFormikContext<CampaignFormValues>();
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    formik;
  const error = (field: keyof CampaignFormValues) =>
    touched[field] && typeof errors[field] === "string"
      ? errors[field]
      : undefined;
  return (
    <section className={styles.card}>
      <header>
        <h2>{t("campaignsUi.general")}</h2>
        <p>{t("campaignsUi.generalDescription")}</p>
      </header>
      <div className={styles.grid}>
        <div className={styles.wide}>
          <FormField
            id="campaign-field-name"
            label={t("campaignsUi.campaignName")}
            required
            error={error("name")}
          >
            {(field) => (
              <Input
                {...field}
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t("campaignsUi.namePlaceholder")}
              />
            )}
          </FormField>
        </div>
        <div className={styles.wide}>
          <FormField
            id="campaign-field-tags"
            label={t("campaignsUi.campaignTags")}
            error={error("tags")}
          >
            {(field) => (
              <TagInput
                id={field.id}
                aria-label={t("campaignsUi.campaignTags")}
                value={values.tags}
                onValueChange={(tags: string[]) =>
                  void setFieldValue("tags", tags)
                }
                placeholder={t("campaignsUi.tagsPlaceholder")}
                labels={{
                  tags: t("campaignsUi.campaignTags"),
                  remove: (tag) => t("campaignsUi.removeTag", { tag }),
                }}
              />
            )}
          </FormField>
        </div>
        <FormField
          id="campaign-field-type"
          label={t("campaignsUi.campaignType")}
          required
          error={error("type")}
        >
          {(field) => (
            <Select
              {...field}
              disabled={isEdit}
              value={values.type}
              options={[
                { value: "TEMPLATE", label: t("campaignsUi.types.TEMPLATE") },
                { value: "CONCRETE", label: t("campaignsUi.types.CONCRETE") },
              ]}
              onValueChange={(type) => {
                void setFieldValue("type", type);
                if (type === "TEMPLATE") {
                  void setFieldValue("targetGroupId", null);
                  void setFieldValue("scheduleEnabled", false);
                } else {
                  void setFieldValue("status", "PUBLISHED");
                  void setFieldValue("scheduleEnabled", true);
                }
              }}
            />
          )}
        </FormField>
        <FormField
          id="campaign-field-status"
          label={t("campaignsUi.status")}
          hint={
            values.type === "CONCRETE" && values.scheduleEnabled
              ? t("campaignsUi.scheduledPublished")
              : undefined
          }
          error={error("status")}
        >
          {(field) => (
            <Select
              {...field}
              value={values.status}
              options={[
                { value: "DRAFT", label: t("campaignsUi.statuses.DRAFT") },
                {
                  value: "PUBLISHED",
                  label: t("campaignsUi.statuses.PUBLISHED"),
                },
              ]}
              onValueChange={(status) => {
                void setFieldValue("status", status);
                if (status === "DRAFT")
                  void setFieldValue("scheduleEnabled", false);
              }}
            />
          )}
        </FormField>
        {values.type === "CONCRETE" && (
          <FormField
            id="campaign-field-targetGroupId"
            label={t("campaignsUi.targetGroup")}
            required
            error={error("targetGroupId")}
          >
            {(field) => (
              <Autocomplete
                {...field}
                value={values.targetGroupId ?? ""}
                options={targetGroups.map((group) => ({
                  value: group.id,
                  label: `${group.name} (${t("campaignsUi.recipientCount", { count: group.userCount })})`,
                }))}
                onValueChange={(id) => {
                  void setFieldValue("targetGroupId", id);
                  const group = targetGroups.find((item) => item.id === id);
                  if (group && group.userCount > 600) {
                    void setFieldValue("scheduleDeliveryMode", "DRIP");
                    void setFieldValue("scheduleDripEmailsPerMinute", 60);
                    void setFieldValue("scheduleBatchSize", null);
                    void setFieldValue("scheduleBatchIntervalMinutes", null);
                  }
                }}
                placeholder={t("campaignsUi.searchGroups")}
              />
            )}
          </FormField>
        )}
        <FormField
          id="campaign-field-targetTimezone"
          label={t("campaignsUi.targetTimezone")}
          required
          error={error("targetTimezone")}
        >
          {(field) => (
            <Autocomplete
              {...field}
              value={values.targetTimezone}
              options={timezones.map((zone) => ({ value: zone, label: zone }))}
              onValueChange={(zone) => {
                void setFieldValue("targetTimezone", zone);
                if (!values.scheduleEnabled)
                  void setFieldValue("scheduleTargetTimezone", zone);
              }}
              placeholder={t("campaignsUi.searchTimezones")}
            />
          )}
        </FormField>
        <label
          id="campaign-field-automaticallyComplete"
          tabIndex={-1}
          className={styles.check}
        >
          <Checkbox
            checked={values.automaticallyComplete}
            onCheckedChange={(checked) => {
              const enabled = checked === true;
              void setFieldValue("automaticallyComplete", enabled);
              void setFieldValue(
                "autoCompleteAfterDays",
                enabled ? (values.autoCompleteAfterDays ?? 20) : null,
              );
            }}
          />
          <span>
            <strong>{t("campaignsUi.autoComplete")}</strong>
            <small>{t("campaignsUi.autoCompleteDescription")}</small>
          </span>
        </label>
        {values.automaticallyComplete && (
          <FormField
            id="campaign-field-autoCompleteAfterDays"
            label={t("campaignsUi.completionDuration")}
            error={error("autoCompleteAfterDays")}
          >
            {(field) => (
              <Input
                {...field}
                type="number"
                min={1}
                value={values.autoCompleteAfterDays ?? ""}
                onChange={(event) =>
                  void setFieldValue(
                    "autoCompleteAfterDays",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              />
            )}
          </FormField>
        )}
      </div>
    </section>
  );
}
