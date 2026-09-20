import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { InitialPasswordScreen } from "../../../../apps/next-app/src/components/organisms/initial-password";
import { InitialPasswordView } from "../../../../apps/next-app/src/components/organisms/initial-password/parts/initial-password-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

function InitialPasswordPreview({
  locale = "en",
  invalid = false,
}: {
  locale?: "en" | "bg";
  invalid?: boolean;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <InitialPasswordScreen>
        <Formik
          initialValues={{
            password: invalid ? "short" : "",
            confirmPassword: "",
          }}
          initialErrors={
            invalid
              ? {
                  password: "Use at least 8 characters",
                  confirmPassword: "Confirm your password",
                }
              : undefined
          }
          initialTouched={
            invalid ? { password: true, confirmPassword: true } : undefined
          }
          onSubmit={() => undefined}
        >
          <InitialPasswordView error="" />
        </Formik>
      </InitialPasswordScreen>
    </I18nProvider>
  );
}

const meta = {
  title: "Screens/Initial password",
  component: InitialPasswordPreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InitialPasswordPreview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const English: Story = {};
export const BulgarianInvalid: Story = {
  args: { locale: "bg", invalid: true },
};
