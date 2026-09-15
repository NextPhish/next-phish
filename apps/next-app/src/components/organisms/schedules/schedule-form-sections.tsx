"use client";
import { getIn, useFormikContext } from "formik";
import {
  Autocomplete,
  Checkbox,
  FormField,
  Input,
  MultiSelect,
  Select,
} from "@next-phish/ui";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./schedule-form.module.css";

interface Props {
  campaigns: Array<{ id: string; name: string; type: "TEMPLATE" | "CONCRETE" }>;
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
}
export function ScheduleFormSections({ campaigns, targetGroups }: Props) {
  const f = useFormikContext<ScheduleFormValues>();
  const t = useTranslation();
  const error = (name: string) =>
    getIn(f.touched, name)
      ? (getIn(f.errors, name) as string | undefined)
      : undefined;
  const setNumber = (name: string, value: string) =>
    void f.setFieldValue(name, value === "" ? null : Number(value));
  const section = (
    title: string,
    description: string,
    content: React.ReactNode,
  ) => (
    <section className={styles.section}>
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {content}
    </section>
  );
  const repeating = f.values.type === "RECURRING";
  const selected = campaigns.filter((c) =>
    f.values.sourceCampaignIds.includes(c.id),
  );
  const inherits = !repeating && selected[0]?.type === "CONCRETE";
  return (
    <>
      {section(
        t("scheduleUi.details"),
        t("scheduleUi.detailsDescription"),
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
                      remove: (label) =>
                        t("scheduleUi.removeOption", { label }),
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
              inherits
                ? t("scheduleUi.inheritedHint")
                : t("scheduleUi.groupHint")
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
                onChange={(e) =>
                  void f.setFieldValue("startsAt", e.target.value)
                }
                onBlur={() => void f.setFieldTouched("startsAt", true)}
              />
            )}
          </FormField>
        </div>,
      )}
      {repeating
        ? section(
            t("scheduleUi.recurrence"),
            t("scheduleUi.recurrenceDescription"),
            <div className={styles.grid3}>
              <FormField
                id="schedule-frequency"
                label={t("scheduleUi.frequency")}
                error={error("frequency")}
                required
              >
                {(c) => (
                  <Select
                    {...c}
                    placeholder={t("scheduleUi.choose")}
                    value={f.values.frequency ?? undefined}
                    options={[
                      "WEEKLY",
                      "MONTHLY",
                      "QUARTERLY",
                      "HALF_YEARLY",
                      "YEARLY",
                    ].map((value) => ({
                      value,
                      label: t(`scheduleUi.options.${value}`),
                    }))}
                    onValueChange={(v) => void f.setFieldValue("frequency", v)}
                  />
                )}
              </FormField>
              <FormField
                id="schedule-selectionStrategy"
                label={t("scheduleUi.strategy")}
                error={error("selectionStrategy")}
                required
              >
                {(c) => (
                  <Select
                    {...c}
                    placeholder={t("scheduleUi.choose")}
                    value={f.values.selectionStrategy ?? undefined}
                    options={["DECK", "RANDOM"].map((value) => ({
                      value,
                      label: t(`scheduleUi.options.${value}`),
                    }))}
                    onValueChange={(v) =>
                      void f.setFieldValue("selectionStrategy", v)
                    }
                  />
                )}
              </FormField>
              <FormField
                id="schedule-localTimeMinutes"
                label={t("scheduleUi.localTime")}
                error={error("localTimeMinutes")}
                required
              >
                {(c) => (
                  <Input
                    {...c}
                    type="time"
                    value={
                      f.values.localTimeMinutes === null
                        ? ""
                        : `${String(Math.floor(f.values.localTimeMinutes / 60)).padStart(2, "0")}:${String(f.values.localTimeMinutes % 60).padStart(2, "0")}`
                    }
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value
                        .split(":")
                        .map(Number);
                      void f.setFieldValue(
                        "localTimeMinutes",
                        e.target.value ? hours * 60 + minutes : null,
                      );
                    }}
                  />
                )}
              </FormField>
              {f.values.frequency === "WEEKLY" ? (
                <FormField
                  id="schedule-weekday"
                  label={t("scheduleUi.weekday")}
                  error={error("weekday")}
                  required
                >
                  {(c) => (
                    <Select
                      {...c}
                      placeholder={t("scheduleUi.choose")}
                      value={f.values.weekday?.toString()}
                      options={Array.from({ length: 7 }, (_, value) => ({
                        value: String(value),
                        label: t(`scheduleUi.weekdays.${value}`),
                      }))}
                      onValueChange={(v) =>
                        void f.setFieldValue("weekday", Number(v))
                      }
                    />
                  )}
                </FormField>
              ) : (
                <FormField
                  id="schedule-dayOfMonth"
                  label={t("scheduleUi.dayOfMonth")}
                  error={error("dayOfMonth")}
                  required
                >
                  {(c) => (
                    <Input
                      {...c}
                      type="number"
                      min={1}
                      max={31}
                      value={f.values.dayOfMonth ?? ""}
                      onChange={(e) => setNumber("dayOfMonth", e.target.value)}
                    />
                  )}
                </FormField>
              )}
              {f.values.frequency === "YEARLY" ? (
                <FormField
                  id="schedule-month"
                  label={t("scheduleUi.month")}
                  error={error("month")}
                  required
                >
                  {(c) => (
                    <Input
                      {...c}
                      type="number"
                      min={1}
                      max={12}
                      value={f.values.month ?? ""}
                      onChange={(e) => setNumber("month", e.target.value)}
                    />
                  )}
                </FormField>
              ) : null}
              {f.values.selectionStrategy === "DECK" ? (
                <label className={styles.checkRow}>
                  <Checkbox
                    checked={f.values.shuffleDeck}
                    onCheckedChange={(v) =>
                      void f.setFieldValue("shuffleDeck", v === true)
                    }
                  />
                  <span>{t("scheduleUi.shuffleDeck")}</span>
                </label>
              ) : null}
            </div>,
          )
        : null}
      {section(
        t("scheduleUi.delivery"),
        t("scheduleUi.deliveryDescription"),
        <div className={styles.grid3}>
          <FormField
            id="schedule-deliveryMode"
            label={t("scheduleUi.deliveryMode")}
            required
          >
            {(c) => (
              <Select
                {...c}
                value={f.values.deliveryMode}
                options={["BLAST", "DRIP", "BATCH"].map((value) => ({
                  value,
                  label: t(`scheduleUi.options.${value}`),
                }))}
                onValueChange={(v) => {
                  void f.setFieldValue("deliveryMode", v);
                  void f.setFieldValue(
                    "dripEmailsPerMinute",
                    v === "DRIP" ? (f.values.dripEmailsPerMinute ?? 60) : null,
                  );
                  void f.setFieldValue(
                    "batchSize",
                    v === "BATCH" ? (f.values.batchSize ?? 100) : null,
                  );
                  void f.setFieldValue(
                    "batchIntervalMinutes",
                    v === "BATCH"
                      ? (f.values.batchIntervalMinutes ?? 60)
                      : null,
                  );
                }}
              />
            )}
          </FormField>
          {f.values.deliveryMode === "DRIP" ? (
            <FormField
              id="schedule-dripEmailsPerMinute"
              label={t("scheduleUi.dripRate")}
              error={error("dripEmailsPerMinute")}
              required
            >
              {(c) => (
                <Input
                  {...c}
                  type="number"
                  min={1}
                  value={f.values.dripEmailsPerMinute ?? ""}
                  onChange={(e) =>
                    setNumber("dripEmailsPerMinute", e.target.value)
                  }
                />
              )}
            </FormField>
          ) : null}
          {f.values.deliveryMode === "BATCH" ? (
            <>
              <FormField
                id="schedule-batchSize"
                label={t("scheduleUi.batchSize")}
                error={error("batchSize")}
                required
              >
                {(c) => (
                  <Input
                    {...c}
                    type="number"
                    min={1}
                    value={f.values.batchSize ?? ""}
                    onChange={(e) => setNumber("batchSize", e.target.value)}
                  />
                )}
              </FormField>
              <FormField
                id="schedule-batchIntervalMinutes"
                label={t("scheduleUi.batchInterval")}
                error={error("batchIntervalMinutes")}
                required
              >
                {(c) => (
                  <Input
                    {...c}
                    type="number"
                    min={1}
                    value={f.values.batchIntervalMinutes ?? ""}
                    onChange={(e) =>
                      setNumber("batchIntervalMinutes", e.target.value)
                    }
                  />
                )}
              </FormField>
            </>
          ) : null}
        </div>,
      )}
      {section(
        t("scheduleUi.completion"),
        t("scheduleUi.completionDescription"),
        <div className={styles.grid}>
          {repeating ? (
            <>
              <FormField
                id="schedule-maxCampaigns"
                label={t("scheduleUi.maxCampaigns")}
                error={error("maxCampaigns")}
              >
                {(c) => (
                  <Input
                    {...c}
                    type="number"
                    min={1}
                    value={f.values.maxCampaigns ?? ""}
                    onChange={(e) => setNumber("maxCampaigns", e.target.value)}
                  />
                )}
              </FormField>
              <FormField id="schedule-endsAt" label={t("scheduleUi.endDate")}>
                {(c) => (
                  <Input
                    {...c}
                    type="datetime-local"
                    value={f.values.endsAt ?? ""}
                    onChange={(e) =>
                      void f.setFieldValue("endsAt", e.target.value || null)
                    }
                  />
                )}
              </FormField>
            </>
          ) : null}
          <label className={styles.checkRow}>
            <Checkbox
              checked={f.values.autoCompleteAfterDays !== null}
              onCheckedChange={(v) =>
                void f.setFieldValue(
                  "autoCompleteAfterDays",
                  v === true ? (f.values.autoCompleteAfterDays ?? 20) : null,
                )
              }
            />
            <span>
              <strong>{t("scheduleUi.autoComplete")}</strong>
              <small>{t("scheduleUi.autoCompleteHint")}</small>
            </span>
          </label>
          {f.values.autoCompleteAfterDays !== null ? (
            <FormField
              id="schedule-autoCompleteAfterDays"
              label={t("scheduleUi.completionDays")}
              error={error("autoCompleteAfterDays")}
              required
            >
              {(c) => (
                <Input
                  {...c}
                  type="number"
                  min={1}
                  value={f.values.autoCompleteAfterDays ?? ""}
                  onChange={(e) =>
                    setNumber("autoCompleteAfterDays", e.target.value)
                  }
                />
              )}
            </FormField>
          ) : null}
        </div>,
      )}
    </>
  );
}
