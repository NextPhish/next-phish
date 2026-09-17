import { Formik } from "formik";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmailTemplateForm } from "../../../../apps/next-app/src/components/organisms/email-templates/email-template-form";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { createTranslator } from "../../../../apps/next-app/src/lib/i18n/shared";
import { emailTemplateFormValidator } from "../../../../apps/next-app/src/components/organisms/email-templates/email-template-form-validation";

function Preview({ locale = "en" }: { locale?: "en" | "bg" }) {
  const t = createTranslator(locale);
  return (
    <I18nProvider initialLocale={locale}>
      <Formik
        initialValues={{
          name: "Quarterly awareness",
          tags: ["security", "training"],
          status: "DRAFT" as const,
          trackingPixel: true,
        }}
        validate={emailTemplateFormValidator(t)}
        onSubmit={() => {}}
      >
        <EmailTemplateForm
          t={t}
          attachedFiles={[
            {
              id: "guide",
              name: "Awareness guide.pdf",
              size: 284000,
              format: "application/pdf",
            },
          ]}
          uploading={false}
          status={{ type: "idle", message: "" }}
          onUpload={async () => {}}
          onRemove={async () => {}}
          onCancel={() => {}}
          editor={
            <div style={{ padding: 32, minHeight: 300, background: "#fff" }}>
              <h2>Security awareness update</h2>
              <p>Hello {"{{.FirstName}}"},</p>
              <p>Review the latest guidance for your team.</p>
              <p style={{ color: "#626d80", marginTop: 40 }}>
                Editor canvas preview. The application loads the interactive
                GrapesJS editor here.
              </p>
            </div>
          }
        />
      </Formik>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Email templates/Form",
  component: Preview,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Bulgarian: Story = { args: { locale: "bg" } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
