import type { CampaignFormValues } from "@next-phish/shared";
export function buildCampaignPayload(values: CampaignFormValues) {
  return {
    name: values.name,
    tags: values.tags,
    type: values.type,
    status: values.status,
    emailTemplateId: values.emailTemplateId,
    pageId: values.pageId,
    mailSendingProfileId: values.mailSendingProfileId,
    targetGroupId: values.type === "TEMPLATE" ? null : values.targetGroupId,
    targetTimezone: values.targetTimezone,
    autoCompleteAfterDays: values.automaticallyComplete
      ? values.autoCompleteAfterDays
      : null,
  };
}
