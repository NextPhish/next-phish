export interface EmailTemplatePayloadValues {
  name: string;
  tags: string[];
  status: "DRAFT" | "ACTIVE";
  trackingPixel: boolean;
  fileIds: string[];
}

export function buildEmailTemplatePayload(
  values: EmailTemplatePayloadValues,
  html: string,
  design: unknown,
) {
  return {
    name: values.name.trim(),
    tags: values.tags.flatMap((tag) => {
      const normalized = tag.trim();
      return normalized ? [normalized] : [];
    }),
    html,
    design,
    status: values.status,
    trackingPixel: values.trackingPixel,
    fileIds: values.fileIds,
  };
}
