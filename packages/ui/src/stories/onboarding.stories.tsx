import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { createOrganizationSchema } from "@next-phish/shared";
import { OnboardingScreen } from "../../../../apps/next-app/src/components/organisms/onboarding/parts/screen";
import { OnboardingView } from "../../../../apps/next-app/src/components/organisms/onboarding/parts/onboarding-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
function OnboardingDemo({
  locale = "en",
  slugStatus = "idle",
}: {
  locale?: "en" | "bg";
  slugStatus?: "idle" | "checking" | "available" | "taken" | "error";
}) {
  return (
    <I18nProvider key={locale} initialLocale={locale}>
      <OnboardingScreen>
        <Formik
          initialValues={{ name: "", slug: "" }}
          validate={toFormikValidation(createOrganizationSchema)}
          onSubmit={(_, helpers) => helpers.setStatus(true)}
        >
          {({ status }) => (
            <OnboardingView
              slugStatus={slugStatus}
              error={
                status
                  ? locale === "bg"
                    ? "Преглед: организацията не е създадена."
                    : "Preview: no organization was created."
                  : ""
              }
            />
          )}
        </Formik>
      </OnboardingScreen>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Create organization",
  component: OnboardingDemo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SlugAvailable: Story = { args: { slugStatus: "available" } };
export const Bulgarian: Story = { args: { locale: "bg" } };
export const SlugTaken: Story = { args: { slugStatus: "taken" } };
export const Checking: Story = { args: { slugStatus: "checking" } };
export const CheckFailed: Story = { args: { slugStatus: "error" } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
