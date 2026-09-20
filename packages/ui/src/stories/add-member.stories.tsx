import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import { Button, Dialog } from "../index";
import { AddMemberFields } from "../../../../apps/next-app/src/components/organisms/organizations/organization-detail/add-member/parts/add-member-fields";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";

function AddMemberContent({
  welcomeWarning,
  invalid,
}: {
  welcomeWarning: boolean;
  invalid: boolean;
}) {
  const t = useTranslation();
  return (
    <Formik
      initialValues={{
        organizationId: "org-preview",
        name: welcomeWarning ? "Jordan Lee" : "",
        email: welcomeWarning ? "jordan@example.com" : "",
      }}
      initialErrors={
        invalid
          ? {
              name: t("organizations.validation.nameRequired"),
              email: t("organizations.validation.emailInvalid"),
            }
          : undefined
      }
      initialTouched={invalid ? { name: true, email: true } : undefined}
      onSubmit={() => undefined}
    >
      <AddMemberFields
        error=""
        welcomeWarning={
          welcomeWarning ? t("organizations.welcomeNotQueued") : ""
        }
        retrying={false}
        onRetryWelcome={() => undefined}
        onCancel={() => undefined}
        needsName={invalid || welcomeWarning}
      />
    </Formik>
  );
}

function AddMemberPreview({
  welcomeWarning = false,
  locale = "en",
  invalid = false,
  existingAccount = false,
}: {
  welcomeWarning?: boolean;
  locale?: "en" | "bg";
  invalid?: boolean;
  existingAccount?: boolean;
}) {
  return (
    <I18nProvider initialLocale={locale}>
      {existingAccount ? (
        <ExistingAccountPreview />
      ) : (
        <AddMemberContent welcomeWarning={welcomeWarning} invalid={invalid} />
      )}
    </I18nProvider>
  );
}

function ExistingAccountPreview() {
  const t = useTranslation();
  return (
    <Dialog
      open
      title={t("organizations.existingMemberTitle")}
      description={t("organizations.existingMemberDescription", {
        email: "existing@example.com",
      })}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="secondary">{t("common.cancel")}</Button>
          <Button>{t("organizations.addExistingMember")}</Button>
        </>
      }
    >
      <p>{t("organizations.existingMemberOnlyAccess")}</p>
    </Dialog>
  );
}

const meta = {
  title: "Application/Organizations/Add member",
  component: AddMemberPreview,
} satisfies Meta<typeof AddMemberPreview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SetupEmailPending: Story = {
  args: { welcomeWarning: true },
};
export const BulgarianInvalid: Story = {
  args: { locale: "bg", invalid: true },
};
export const ExistingAccount: Story = { args: { existingAccount: true } };
