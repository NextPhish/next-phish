import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { createOrganizationSchema } from "@next-phish/shared";
import { Button, Dialog } from "../index";
import { OnboardingView } from "../../../../apps/next-app/src/components/organisms/onboarding/parts/onboarding-view";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
import { useState } from "react";
function PreviewDialog() {
  const [open, setOpen] = useState(true);
  const t = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>{t("organizations.createTitle")}</Button>}
      title={t("organizations.createTitle")}
      description={t("onboarding.subtitle")}
      closeLabel={t("common.cancel")}
    >
      <Formik
        initialValues={{ name: "", slug: "" }}
        validate={toFormikValidation(createOrganizationSchema)}
        onSubmit={(_, helpers) =>
          helpers.setStatus("Preview only — no organization was created.")
        }
      >
        {({ status }) => (
          <OnboardingView
            error={status ?? ""}
            onCancel={() => setOpen(false)}
          />
        )}
      </Formik>
    </Dialog>
  );
}
function Demo({ locale = "en" }: { locale?: "en" | "bg" }) {
  return (
    <I18nProvider key={locale} initialLocale={locale}>
      <PreviewDialog />
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Create organization dialog",
  component: Demo,
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Bulgarian: Story = { args: { locale: "bg" } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
