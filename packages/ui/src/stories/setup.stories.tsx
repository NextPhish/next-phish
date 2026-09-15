import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { setupSchema } from "@next-phish/shared";
import { AuthLayoutSkeleton } from "../index";
import { SetupScreen } from "../../../../apps/next-app/src/components/organisms/setup/screen";
import { SetupPresentation } from "../../../../apps/next-app/src/components/organisms/setup/presentation";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
function SetupDemo({
  locale = "en",
  serverError = false,
  loading = false,
}: {
  locale?: "en" | "bg";
  serverError?: boolean;
  loading?: boolean;
}) {
  if (loading) return <AuthLayoutSkeleton />;
  return (
    <I18nProvider key={locale} initialLocale={locale}>
      <SetupScreen
        signInLink={<a href="/login">{locale === "bg" ? "Вход" : "Sign in"}</a>}
      >
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validate={toFormikValidation(setupSchema)}
          onSubmit={(_, helpers) => helpers.setStatus(true)}
        >
          {({ status }) => (
            <SetupPresentation
              error={
                serverError || status
                  ? locale === "bg"
                    ? "Преглед: акаунтът не е създаден. Опитайте отново."
                    : "Preview: no account was created. Please try again."
                  : ""
              }
            />
          )}
        </Formik>
      </SetupScreen>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Initial setup",
  component: SetupDemo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SetupDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Bulgarian: Story = { args: { locale: "bg" } };
export const ServerError: Story = { args: { serverError: true } };
export const Loading: Story = { args: { loading: true } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
