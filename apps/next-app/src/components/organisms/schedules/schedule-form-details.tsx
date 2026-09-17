"use client";

import {
  Autocomplete,
  FormField,
  Input,
  MultiSelect,
  Select,
} from "@next-phish/ui";
import { useScheduleFormFields } from "@/src/hooks/use-schedule-form-fields";
import styles from "./schedule-form.module.css";
import { ScheduleFormSection } from "./schedule-form-section";

interface Props {
  campaigns: Array<{ id: string; name: string; type: "TEMPLATE" | "CONCRETE" }>;
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
}
export function ScheduleFormDetails({ campaigns, targetGroups }: Props) {
  const { f, t, error } = useScheduleFormFields();
  const repeating = f.values.type === "RECURRING";
  const selectedIds = new Set(f.values.sourceCampaignIds);
  const selected = campaigns.filter((c) => selectedIds.has(c.id));
  const inherits = !repeating && selected[0]?.type === "CONCRETE";
  return (
    <ScheduleFormSection
      title={t("scheduleUi.details")}
      description={t("scheduleUi.detailsDescription")}
    >
      <div className={styles.grid}>
        <FormField
          id="schedule-name"
          label={t("scheduleUi.name")}
          error={error("name")}
          required
        >
          {(c) => (
            <Input
              {...c}
              name="name"
              value={f.values.name}
              onChange={(e) => void f.setFieldValue("name", e.target.value)}
              onBlur={() => void f.setFieldTouched("name", true)}
            />
          )}
        </FormField>
        <FormField id="schedule-type" label={t("scheduleUi.type")} required>
          {(c) => (
            <Select
              {...c}
              value={f.values.type}
              options={["ONE_TIME", "RECURRING"].map((value) => ({
                value,
                label: t(`scheduleUi.options.${value}`),
              }))}
              onValueChange={(value) => {
                void f.setFieldValue("type", value);
                void f.setFieldValue("sourceCampaignIds", []);
                void f.setFieldValue("targetGroupId", null);
              }}
            />
          )}
        </FormField>
        <div className={styles.wide}>
          <FormField
            id="schedule-sourceCampaignIds"
            label={t("scheduleUi.sources")}
            error={error("sourceCampaignIds")}
            required
          >
            {(c) =>
              repeating ? (
                <MultiSelect
                  {...c}
                  value={f.values.sourceCampaignIds}
                  options={campaigns
                    .filter((x) => x.type === "TEMPLATE")
                    .map((x) => ({ value: x.id, label: x.name }))}
                  onValueChange={(value) =>
                    void f.setFieldValue("sourceCampaignIds", value)
                  }
                  placeholder={t("scheduleUi.selectTemplates")}
                  labels={{
                    search: t("scheduleUi.searchTemplates"),
                    empty: t("scheduleUi.noCampaigns"),
                    selected: (count) =>
                      t("scheduleUi.selectedCount", { count }),
                    remove: (label) => t("scheduleUi.removeOption", { label }),
                    clear: t("scheduleUi.clear"),
                    done: t("scheduleUi.done"),
                    options: t("scheduleUi.sources"),
                  }}
                />
              ) : (
                <Autocomplete
                  {...c}
                  value={f.values.sourceCampaignIds[0] ?? ""}
                  options={campaigns.map((x) => ({
                    value: x.id,
                    label: x.name,
                  }))}
                  onValueChange={(value) => {
                    void f.setFieldValue(
                      "sourceCampaignIds",
                      value ? [value] : [],
                    );
                    void f.setFieldValue("targetGroupId", null);
                  }}
                  placeholder={t("scheduleUi.selectCampaign")}
                  emptyLabel={t("scheduleUi.noCampaigns")}
                  listLabel={t("scheduleUi.sources")}
                />
              )
            }
          </FormField>
        </div>
        <FormField
          id="schedule-targetGroupId"
          label={t("scheduleUi.targetGroup")}
          error={error("targetGroupId")}
          required={repeating || selected.some((x) => x.type === "TEMPLATE")}
          hint={
            inherits ? t("scheduleUi.inheritedHint") : t("scheduleUi.groupHint")
          }
        >
          {(c) => (
            <Autocomplete
              {...c}
              disabled={inherits}
              value={f.values.targetGroupId ?? ""}
              options={targetGroups.map((x) => ({
                value: x.id,
                label: `${x.name} (${x.userCount})`,
              }))}
              onValueChange={(value) => {
                void f.setFieldValue("targetGroupId", value || null);
                const g = targetGroups.find((x) => x.id === value);
                if (g && g.userCount > 600) {
                  void f.setFieldValue("deliveryMode", "DRIP");
                  void f.setFieldValue("dripEmailsPerMinute", 60);
                  void f.setFieldValue("batchSize", null);
                  void f.setFieldValue("batchIntervalMinutes", null);
                }
              }}
              placeholder={
                inherits
                  ? t("scheduleUi.inherited")
                  : t("scheduleUi.selectGroup")
              }
              emptyLabel={t("scheduleUi.noGroups")}
            />
          )}
        </FormField>
        <FormField
          id="schedule-targetTimezone"
          label={t("scheduleUi.timezone")}
          error={error("targetTimezone")}
          required
        >
          {(c) => (
            <Autocomplete
              {...c}
              value={f.values.targetTimezone}
              options={[
                ...new Set([
                  f.values.targetTimezone,
                  "UTC",
                  ...(Intl.supportedValuesOf?.("timeZone") ?? []),
                ]),
              ].map((value) => ({ value, label: value }))}
              onValueChange={(value) =>
                void f.setFieldValue("targetTimezone", value)
              }
              placeholder={t("scheduleUi.searchTimezones")}
            />
          )}
        </FormField>
        <FormField
          id="schedule-startsAt"
          label={t("scheduleUi.firstOccurrence")}
          error={error("startsAt")}
          required
        >
          {(c) => (
            <Input
              {...c}
              type="datetime-local"
              value={f.values.startsAt}
              onChange={(e) => void f.setFieldValue("startsAt", e.target.value)}
              onBlur={() => void f.setFieldTouched("startsAt", true)}
            />
          )}
        </FormField>
      </div>
    </ScheduleFormSection>
  );
}
