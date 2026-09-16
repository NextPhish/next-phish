import { Formik } from "formik";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { SendingProfileFormPresentation } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form-presentation";

const cases = [
  ["SMTP", "Host"],
  ["MICROSOFT_GRAPH", "Tenant ID"],
  ["AWS_SES", "Region"],
  ["SENDGRID", "API key"],
  ["MAILGUN", "Domain"],
  ["POSTMARK", "API key"],
  ["RESEND", "API key"],
  ["GENERAL_API", "Send endpoint"],
] as const;
describe("sending profile provider forms", () => {
  for (const [providerType, fieldLabel] of cases) {
    it(`renders ${providerType} config and locks provider on edit`, () => {
      render(
        <I18nProvider initialLocale="en">
          <Formik
            initialValues={{
              name: "Delivery",
              providerType,
              fromName: "Security",
              fromEmail: "security@example.com",
              replyToEmail: "",
              isDefault: false,
              providerConfig: {},
            }}
            onSubmit={() => undefined}
          >
            <SendingProfileFormPresentation
              isEdit
              error=""
              onCancel={() => {}}
              onTest={() => {}}
            />
          </Formik>
        </I18nProvider>,
      );
      expect(
        screen.getByText(fieldLabel, { selector: "label" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: /Provider type/ }),
      ).toBeDisabled();
    });
  }
});
