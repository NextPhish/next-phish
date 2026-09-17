"use client";

import { FormField, Input, Select } from "@next-phish/ui";
import { useScheduleFormFields } from "@/src/hooks/use-schedule-form-fields";
import styles from "./schedule-form.module.css";
import { ScheduleFormSection } from "./schedule-form-section";

export function ScheduleFormDelivery() {
  const { f, t, error, setNumber } = useScheduleFormFields();
  return (
    <ScheduleFormSection
      title={t("scheduleUi.delivery")}
      description={t("scheduleUi.deliveryDescription")}
    >
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
                  v === "BATCH" ? (f.values.batchIntervalMinutes ?? 60) : null,
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
      </div>
    </ScheduleFormSection>
  );
}
