"use client";

import { Checkbox, FormField, Input, Select } from "@next-phish/ui";
import { useScheduleFormFields } from "@/src/hooks/use-schedule-form-fields";
import styles from "./schedule-form.module.css";
import { ScheduleFormSection } from "./schedule-form-section";

export function ScheduleFormRecurrence() {
  const { f, t, error, setNumber } = useScheduleFormFields();
  const repeating = f.values.type === "RECURRING";
  if (!repeating) return null;
  return (
    <ScheduleFormSection
      title={t("scheduleUi.recurrence")}
      description={t("scheduleUi.recurrenceDescription")}
    >
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
                const [hours, minutes] = e.target.value.split(":").map(Number);
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
      </div>
    </ScheduleFormSection>
  );
}
