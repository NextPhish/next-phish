import { describe, expect, it } from "vitest";
import { emailTemplateFormValidator } from "../../../../apps/next-app/src/components/organisms/email-templates/email-template-form/email-template-form-validation";

describe("email template form validation", () => {
  it("uses the shared create schema and translates its exact errors", () => {
    const t = (key: string) => `translated:${key}`;
    const validate = emailTemplateFormValidator(t);
    expect(
      validate({
        name: "   ",
        tags: [""],
        status: "DRAFT",
        trackingPixel: true,
      }),
    ).toMatchObject({
      name: "translated:emailTemplates.validation.nameRequired",
      tags: "translated:emailTemplates.validation.tagRequired",
    });
    expect(
      validate({
        name: "Awareness",
        tags: ["training"],
        status: "ACTIVE",
        trackingPixel: false,
      }),
    ).toEqual({});
  });
});
