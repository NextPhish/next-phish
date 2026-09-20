import { describe, expect, it } from "vitest";
import { sendingProfileFormSchema } from "@next-phish/shared";
import {
  createSendingProfilePayload,
  sendingProfileValuesFromView,
  updateSendingProfilePayload,
} from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form/sending-profile-values";
import { sendingProfileValidator } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form/sending-profile-validation";

describe("sending profile payloads", () => {
  const values = {
    name: " Mail ",
    providerType: "GENERAL_API",
    fromName: " Sender ",
    fromEmail: "sender@example.com",
    replyToEmail: "",
    isDefault: true,
    providerConfig: {
      apiKey: "123456",
      sendEndpoint: "https://api.example.com",
      authMethod: "header",
      authHeaderName: "X-Key",
      port: "587",
      secure: "true",
    },
  };
  it("retains numeric-looking credentials and IDs as strings while serializing known SMTP fields", () => {
    expect(createSendingProfilePayload(values)).toMatchObject({
      name: "Mail",
      fromName: "Sender",
      replyToEmail: undefined,
      isDefault: true,
      providerConfig: {
        apiKey: "123456",
        port: 587,
        secure: true,
        authMethod: "header",
      },
    });
    expect(updateSendingProfilePayload("profile-1", values)).not.toHaveProperty(
      "providerType",
    );
  });
  it("loads masked secrets as strings without modifying other config values", () => {
    expect(
      sendingProfileValuesFromView({
        ...values,
        replyToEmail: null,
        providerConfig: { apiKey: "[REDACTED]", port: 587, secure: false },
      }).providerConfig,
    ).toEqual({ apiKey: "[REDACTED]", port: "587", secure: "false" });
  });
  it("accepts blank reply-to and rejects invalid nonblank address through the shared schema", () => {
    expect(sendingProfileFormSchema.safeParse(values).success).toBe(true);
    expect(
      sendingProfileFormSchema.safeParse({ ...values, replyToEmail: "invalid" })
        .success,
    ).toBe(false);
    const validate = sendingProfileValidator(((key: string) => key) as never);
    expect(validate({ ...values, replyToEmail: "invalid" })).toMatchObject({
      replyToEmail: "sendingProfiles.validation.replyToInvalid",
    });
  });
});
