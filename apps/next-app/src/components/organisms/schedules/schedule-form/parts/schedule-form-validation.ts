import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "@next-phish/shared";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
const validationKeys: Record<string, string> = {
  "Schedule name is required": "nameRequired",
  "Select a campaign source": "sourceRequired",
  "One-time schedules require exactly one source": "oneSourceRequired",
  "Enter a valid IANA timezone": "timezoneInvalid",
  "Start time is required": "startRequired",
  "Select a target group for template schedules": "groupRequired",
  "Select a frequency and strategy": "recurrenceRequired",
  "Select a local recurrence time": "localTimeRequired",
  "Select a weekday": "weekdayRequired",
  "Select a day of month": "dayRequired",
  "Enter an emails-per-minute rate": "dripRequired",
  "Enter a batch size and interval": "batchRequired",
};
export function scheduleFormValidator(
  t: TranslationFunction,
  campaigns: Array<{ id: string; type: "TEMPLATE" | "CONCRETE" }>,
) {
  return (values: ScheduleFormValues) => {
    const errors = toFormikValidation(scheduleFormSchema)(values);
    const selected = new Set(values.sourceCampaignIds);
    if (
      campaigns.some((c) => selected.has(c.id) && c.type === "TEMPLATE") &&
      !values.targetGroupId
    )
      errors.targetGroupId = "Select a target group for template schedules";
    return Object.fromEntries(
      Object.entries(errors).map(([field, message]) => [
        field,
        t(`scheduleUi.validation.${validationKeys[message] ?? "invalid"}`),
      ]),
    );
  };
}
