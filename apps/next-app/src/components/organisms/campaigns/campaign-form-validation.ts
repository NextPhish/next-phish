import {
  campaignFormSchema,
  type CampaignFormValues,
} from "@next-phish/shared";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";

const validationKeys: Record<string, string> = {
  "Campaign name is required": "nameRequired",
  "Select an email template": "emailRequired",
  "Select a landing page": "pageRequired",
  "Select a sending profile": "profileRequired",
  "Enter a valid IANA timezone": "timezoneInvalid",
  "Concrete campaigns require a target group": "groupRequired",
  "Completion duration is required": "completionRequired",
  "Only concrete campaigns can be scheduled directly": "concreteRequired",
  "Publish the campaign before scheduling it": "publishRequired",
  "Schedule name is required": "scheduleNameRequired",
  "Schedule start is required": "startRequired",
  "Emails per minute is required": "dripRequired",
  "Batch size and interval are required": "batchRequired",
};

export function campaignFormValidator(t: TranslationFunction) {
  return (values: CampaignFormValues) => {
    const errors = toFormikValidation(campaignFormSchema)(values);
    return Object.fromEntries(
      Object.entries(errors).map(([field, message]) => [
        field,
        t(`campaignsUi.validation.${validationKeys[message] ?? "invalid"}`),
      ]),
    );
  };
}
