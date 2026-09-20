import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import type { SendingProfileFormValues } from "@next-phish/shared";
import type { MailSendingProfileView } from "../../../backend/src/mail-sending/types/mail-sending-profile.types";
import { AppShell, useDataTableState } from "../index";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { SendingProfileListView } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-list/parts/sending-profile-list-view";
import { SendingProfileFormView } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form/parts/sending-profile-form-view";
import { TestEmailDialogView } from "../../../../apps/next-app/src/components/organisms/sending-profiles/test-email-dialog/parts/test-email-dialog-view";
import { sendingProfileValidator } from "../../../../apps/next-app/src/components/organisms/sending-profiles/sending-profile-form/sending-profile-validation";

const providers = [
  "SMTP",
  "MICROSOFT_GRAPH",
  "AWS_SES",
  "SENDGRID",
  "MAILGUN",
  "POSTMARK",
  "RESEND",
  "GENERAL_API",
];
const rows = providers.map((providerType, index) => ({
  id: `profile-${index}`,
  organizationId: "org-1",
  name: `${providerType} delivery`,
  providerType,
  fromName: "Security team",
  fromEmail: "security@example.com",
  replyToEmail: null as string | null,
  headers: null,
  isDefault: index === 0,
  createdAt: new Date("2026-09-01"),
  updatedAt: new Date("2026-09-12"),
  providerConfig: {},
}));
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navigation={[]}
      activeItem="sending-profiles"
      breadcrumb="Sending profiles"
    >
      {children}
    </AppShell>
  );
}
function ListPreview() {
  const table = useDataTableState();
  const [target, setTarget] = useState<MailSendingProfileView | null>(null);
  const t = useTranslation();
  const provider = table.state.filters.providerType;
  const filtered = rows.filter(
    (row) =>
      (!provider || row.providerType === provider) &&
      row.name.toLowerCase().includes(table.state.search.toLowerCase()),
  );
  return (
    <Shell>
      <SendingProfileListView
        t={t}
        locale="en"
        rows={filtered}
        total={filtered.length}
        state={table.state}
        onStateChange={table.onStateChange}
        loading={false}
        onRetry={() => {}}
        target={target}
        deleting={false}
        deleteError=""
        onCreate={() => {}}
        onEdit={() => {}}
        onAskDelete={setTarget}
        onCancelDelete={() => setTarget(null)}
        onDelete={() => setTarget(null)}
      />
    </Shell>
  );
}
const configs: Record<string, Record<string, string>> = {
  SMTP: {
    host: "smtp.example.com",
    port: "587",
    username: "team",
    password: "[REDACTED]",
    secure: "false",
    requireTls: "true",
  },
  MICROSOFT_GRAPH: {
    tenantId: "tenant-1",
    clientId: "client-1",
    clientSecret: "[REDACTED]",
    senderMailbox: "security@example.com",
  },
  AWS_SES: {
    region: "eu-central-1",
    accessKeyId: "123456",
    secretAccessKey: "[REDACTED]",
  },
  SENDGRID: { apiKey: "[REDACTED]" },
  MAILGUN: { apiKey: "[REDACTED]", domain: "example.com" },
  POSTMARK: { apiKey: "[REDACTED]" },
  RESEND: { apiKey: "[REDACTED]" },
  GENERAL_API: {
    apiKey: "[REDACTED]",
    sendEndpoint: "https://api.example.com/send",
    authMethod: "header",
    authHeaderName: "X-API-Key",
  },
};
function FormPreview({ providerType = "SMTP" }: { providerType?: string }) {
  const t = useTranslation();
  const values: SendingProfileFormValues = {
    name: "Security delivery",
    providerType,
    fromName: "Security team",
    fromEmail: "security@example.com",
    replyToEmail: "",
    isDefault: providerType === "SMTP",
    providerConfig: configs[providerType] ?? {},
  };
  return (
    <Shell>
      <Formik
        initialValues={values}
        validate={sendingProfileValidator(t)}
        onSubmit={() => undefined}
      >
        <SendingProfileFormView
          error=""
          isEdit
          onCancel={() => {}}
          onTest={() => {}}
        />
      </Formik>
    </Shell>
  );
}
function TestDialogPreview() {
  return (
    <Shell>
      <Formik
        initialValues={{ toEmail: "recipient@example.com" }}
        onSubmit={() => undefined}
      >
        <TestEmailDialogView
          visible
          pending={false}
          status={{ type: "idle", message: "" }}
          onClose={() => {}}
        />
      </Formik>
    </Shell>
  );
}
function Preview({
  view = "list",
  providerType = "SMTP",
}: {
  view?: "list" | "form" | "test";
  providerType?: string;
}) {
  return (
    <I18nProvider initialLocale="en">
      {view === "list" ? (
        <ListPreview />
      ) : view === "test" ? (
        <TestDialogPreview />
      ) : (
        <FormPreview providerType={providerType} />
      )}
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Sending profiles",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const List: Story = {};
export const Smtp: Story = { args: { view: "form", providerType: "SMTP" } };
export const MicrosoftGraph: Story = {
  args: { view: "form", providerType: "MICROSOFT_GRAPH" },
};
export const AwsSes: Story = {
  args: { view: "form", providerType: "AWS_SES" },
};
export const SendGrid: Story = {
  args: { view: "form", providerType: "SENDGRID" },
};
export const Mailgun: Story = {
  args: { view: "form", providerType: "MAILGUN" },
};
export const Postmark: Story = {
  args: { view: "form", providerType: "POSTMARK" },
};
export const Resend: Story = { args: { view: "form", providerType: "RESEND" } };
export const GeneralApi: Story = {
  args: { view: "form", providerType: "GENERAL_API" },
};
export const TestDialog: Story = { args: { view: "test" } };
