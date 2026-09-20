import { describe, expect, it } from "vitest";
import { buildEmailTemplatePayload } from "../../../../apps/next-app/src/components/organisms/email-templates/email-template-form/email-template-payload";

describe("email template mutation payload", () => {
  it("preserves editor design, publish status, tracking and attachment ids while normalizing text", () => {
    expect(
      buildEmailTemplatePayload(
        {
          name: "  Security notice ",
          tags: [" urgent ", "", "training"],
          status: "ACTIVE",
          trackingPixel: false,
          fileIds: ["file-1", "file-2"],
        },
        "<main>Hello</main>",
        { pages: [{ id: "page" }] },
      ),
    ).toEqual({
      name: "Security notice",
      tags: ["urgent", "training"],
      html: "<main>Hello</main>",
      design: { pages: [{ id: "page" }] },
      status: "ACTIVE",
      trackingPixel: false,
      fileIds: ["file-1", "file-2"],
    });
  });
});
