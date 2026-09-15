import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { AuthLayout } from "../index";
import { ResetPasswordPresentation } from "../../../../apps/next-app/src/components/organisms/reset-password/presentation";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
function RecoveryPreview({ step = "reset" }: { step?: "reset" | "verify" }) {
  const t = useTranslation();
  return (
    <AuthLayout
      badge={t("resetPassword.badge")}
      title={t("resetPassword.title")}
      subtitle={t("settings.previewNotice")}
      brandTitle={t("login.brandTitle")}
      brandDescription={t("login.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      <Formik
        initialValues={{ otp: "", newPassword: "", confirmPassword: "" }}
        onSubmit={() => {}}
      >
        <ResetPasswordPresentation step={step} error="" />
      </Formik>
    </AuthLayout>
  );
}
const meta = {
  title: "Screens/Password recovery",
  component: RecoveryPreview,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <I18nProvider initialLocale="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof RecoveryPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NewPassword: Story = {};
export const VerificationCode: Story = { args: { step: "verify" } };
