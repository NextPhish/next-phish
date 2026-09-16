"use client";

import { Checkbox, FormField, Input } from "@next-phish/ui";
import { useScheduleFormFields } from "@/src/hooks/use-schedule-form-fields";
import { ScheduleFormSection } from "./schedule-form-section";
import styles from "./schedule-form.module.css";

export function ScheduleFormCompletion() {
  const { f, t, error, setNumber } = useScheduleFormFields();
  const repeating = f.values.type === "RECURRING";
  return (
    <ScheduleFormSection
      title={t("scheduleUi.completion")}
      description={t("scheduleUi.completionDescription")}
    >
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
      </div>
    </ScheduleFormSection>
  );
}
