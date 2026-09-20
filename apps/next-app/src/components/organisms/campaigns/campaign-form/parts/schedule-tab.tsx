"use client";
import { useFormikContext } from "formik";
import type { CampaignFormValues } from "@next-phish/shared";
import {
  Autocomplete,
  Checkbox,
  DateTimePicker,
  FormField,
  FormMessage,
  Input,
  Select,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
interface ScheduleTabProps {
  recipientCount: number;
  hasExistingSchedule: boolean;
}
const timezones = (() => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
})();
export function ScheduleTab({
  recipientCount,
  hasExistingSchedule,
}: ScheduleTabProps) {
  const t = useTranslation();
  const locale = useLocale();
  const { values, errors, touched, setFieldValue } =
    useFormikContext<CampaignFormValues>();
  const error = (field: keyof CampaignFormValues) =>
    touched[field] && typeof errors[field] === "string"
      ? errors[field]
      : undefined;
  return (
    <section
      id="campaign-field-scheduleName"
      tabIndex={-1}
      className="min-w-0 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 shadow-[var(--np-shadow-sm)] [&>header]:mb-5 [&_h2]:text-[1.05rem] [&_h2]:font-bold [&_h2]:text-[var(--np-ink)] [&_p]:block [&_p]:text-[var(--np-muted)] [&_small]:block [&_small]:text-[var(--np-muted)]"
    >
      <label
        id="campaign-field-scheduleEnabled"
        tabIndex={-1}
        className="flex items-start gap-[0.7rem] min-[721px]:col-span-full [&_strong]:block [&_strong]:text-sm [&_strong]:text-[var(--np-ink)]"
      >
        <Checkbox
          checked={values.scheduleEnabled}
          disabled={hasExistingSchedule}
          onCheckedChange={(checked) => {
            const enabled = checked === true;
            void setFieldValue("scheduleEnabled", enabled);
            if (enabled) void setFieldValue("status", "PUBLISHED");
          }}
        />
        <span>
          <strong>{t("campaignsUi.scheduleCampaign")}</strong>
          <small>{t("campaignsUi.scheduleDescription")}</small>
        </span>
      </label>
      {hasExistingSchedule && <p>{t("campaignsUi.existingSchedule")}</p>}
      {values.scheduleEnabled ? (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 min-[721px]:grid-cols-2">
          {recipientCount > 600 && (
            <div className="min-[721px]:col-span-full">
              <FormMessage variant="success">
                {t("campaignsUi.largeAudience", { count: recipientCount })}
              </FormMessage>
            </div>
          )}
          <FormField
            id="campaign-field-scheduleStartsAt"
            label={t("campaignsUi.startDateTime")}
            required
            error={error("scheduleStartsAt")}
          >
            {(field) => (
              <DateTimePicker
                {...field}
                locale={locale}
                value={values.scheduleStartsAt}
                onValueChange={(value) =>
                  void setFieldValue("scheduleStartsAt", value)
                }
              />
            )}
          </FormField>
          <FormField
            id="campaign-field-scheduleTargetTimezone"
            label={t("campaignsUi.scheduleTimezone")}
            required
            error={error("scheduleTargetTimezone")}
          >
            {(field) => (
              <Autocomplete
                {...field}
                value={values.scheduleTargetTimezone}
                options={timezones.map((zone) => ({
                  value: zone,
                  label: zone,
                }))}
                onValueChange={(zone) =>
                  void setFieldValue("scheduleTargetTimezone", zone)
                }
                placeholder={t("campaignsUi.searchTimezones")}
              />
            )}
          </FormField>
          <FormField
            id="campaign-field-scheduleDeliveryMode"
            label={t("campaignsUi.deliveryMode")}
            required
            error={error("scheduleDeliveryMode")}
          >
            {(field) => (
              <Select
                {...field}
                value={values.scheduleDeliveryMode}
                options={[
                  {
                    value: "BLAST",
                    label: t("campaignsUi.deliveryModes.BLAST"),
                  },
                  { value: "DRIP", label: t("campaignsUi.deliveryModes.DRIP") },
                  {
                    value: "BATCH",
                    label: t("campaignsUi.deliveryModes.BATCH"),
                  },
                ]}
                onValueChange={(mode) => {
                  void setFieldValue("scheduleDeliveryMode", mode);
                  void setFieldValue(
                    "scheduleDripEmailsPerMinute",
                    mode === "DRIP"
                      ? (values.scheduleDripEmailsPerMinute ?? 60)
                      : null,
                  );
                  void setFieldValue(
                    "scheduleBatchSize",
                    mode === "BATCH" ? (values.scheduleBatchSize ?? 100) : null,
                  );
                  void setFieldValue(
                    "scheduleBatchIntervalMinutes",
                    mode === "BATCH"
                      ? (values.scheduleBatchIntervalMinutes ?? 60)
                      : null,
                  );
                }}
              />
            )}
          </FormField>
          {values.scheduleDeliveryMode === "DRIP" && (
            <FormField
              id="campaign-field-scheduleDripEmailsPerMinute"
              label={t("campaignsUi.emailsPerMinute")}
              error={error("scheduleDripEmailsPerMinute")}
            >
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  value={values.scheduleDripEmailsPerMinute ?? ""}
                  onChange={(event) =>
                    void setFieldValue(
                      "scheduleDripEmailsPerMinute",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                />
              )}
            </FormField>
          )}
          {values.scheduleDeliveryMode === "BATCH" && (
            <>
              <FormField
                id="campaign-field-scheduleBatchSize"
                label={t("campaignsUi.batchSize")}
                error={error("scheduleBatchSize")}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    value={values.scheduleBatchSize ?? ""}
                    onChange={(event) =>
                      void setFieldValue(
                        "scheduleBatchSize",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                )}
              </FormField>
              <FormField
                id="campaign-field-scheduleBatchIntervalMinutes"
                label={t("campaignsUi.batchInterval")}
                error={error("scheduleBatchIntervalMinutes")}
              >
                {(field) => (
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    value={values.scheduleBatchIntervalMinutes ?? ""}
                    onChange={(event) =>
                      void setFieldValue(
                        "scheduleBatchIntervalMinutes",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                )}
              </FormField>
            </>
          )}
        </div>
      ) : (
        <p>{t("campaignsUi.withoutSchedule")}</p>
      )}
    </section>
  );
}
