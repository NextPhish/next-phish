import { createEmailTemplateSchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

const schema = createEmailTemplateSchema.pick({
  name: true,
  tags: true,
  status: true,
  trackingPixel: true,
});
const messages: Record<string, string> = {
  "Template name is required": "nameRequired",
  "Tag cannot be empty": "tagRequired",
};

export function emailTemplateFormValidator(t: TranslationFunction) {
  return (values: unknown) =>
    Object.fromEntries(
      Object.entries(toFormikValidation(schema)(values)).map(
        ([field, message]) => [
          field.split(".")[0],
          t(`emailTemplates.validation.${messages[message] ?? "invalid"}`),
        ],
      ),
    );
}
