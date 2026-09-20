export interface EmailTemplateFormValues {
  name: string;
  tags: string[];
  status: "DRAFT" | "ACTIVE";
  trackingPixel: boolean;
}
