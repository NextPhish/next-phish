"use client";

import { Checkbox, DateTimePicker, FormField, Input } from "@next-phish/ui";
import { useLocale } from "@/src/lib/i18n";
import { useScheduleFormFields } from "../hooks/use-schedule-form-fields";
import { ScheduleFormSection } from "./schedule-form-section";

export function ScheduleFormCompletion() {
  const { f, t, error, setNumber } = useScheduleFormFields();
  const locale = useLocale();
  const repeating = f.values.type === "RECURRING";
  return (
    <ScheduleFormSection
      title={t("scheduleUi.completion")}
      description={t("scheduleUi.completionDescription")}
    >
      <div className="grid grid-cols-1 gap-4 min-[721px]:grid-cols-2">
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
                <DateTimePicker
                  {...c}
                  locale={locale}
                  value={f.values.endsAt ?? ""}
                  onValueChange={(value) =>
                    void f.setFieldValue("endsAt", value || null)
                  }
                />
              )}
            </FormField>
          </>
        ) : null}
        <label className="flex items-start gap-3 rounded-xl border border-[#dfe3ec] bg-[#f8f9fc] p-4 text-sm font-semibold [&_small]:mt-[0.2rem] [&_small]:block [&_small]:font-normal [&_small]:text-[#626d80]">
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
      </div>
    </ScheduleFormSection>
  );
}
