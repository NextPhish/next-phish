import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Formik } from "formik";
import { createApiKeyFormSchema } from "@next-phish/shared";
import {
  AppShell,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardBody,
  FormMessage,
} from "../index";
import { GeneralSettingsView } from "../../../../apps/next-app/src/components/organisms/settings/general-settings/parts/general-settings-view";
import { ChangePasswordFields } from "../../../../apps/next-app/src/components/organisms/settings/change-password/parts/change-password-fields";
import { TwoFactorSettingsView } from "../../../../apps/next-app/src/components/organisms/settings/two-factor/parts/two-factor-settings-view";
import { NotificationsSettings } from "../../../../apps/next-app/src/components/organisms/settings/user-settings/parts/notifications-settings";
import { ApiKeyListView } from "../../../../apps/next-app/src/components/organisms/settings/api-key-list/parts/api-key-list-view";
import { ApiKeyFields } from "../../../../apps/next-app/src/components/organisms/settings/api-key-form/parts/api-key-fields";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
import {
  profileValidator,
  passwordValidator,
} from "../../../../apps/next-app/src/components/organisms/settings/validation";

const keys = [
  {
    id: "demo-1",
    name: "Reporting integration",
    start: "np_demo…",
    prefix: "np_",
    enabled: true,
    expiresAt: new Date("2030-12-01T12:00:00Z"),
    createdAt: new Date("2026-09-01T12:00:00Z"),
    requestCount: 124,
    rateLimitEnabled: true,
    rateLimitMax: 1000,
  },
];
type Tab = "general" | "security" | "api-keys" | "notifications";
function ProfileContent({ tab }: { tab: Tab }) {
  const t = useTranslation();
  const [preview, setPreview] = useState(false);
  return (
    <AppShell
      navigation={[
        {
          id: "main",
          items: [
            {
              id: "profile",
              label: t("settings.accountTitle"),
              href: "#profile",
            },
          ],
        },
      ]}
      activeItem="profile"
      breadcrumb={t("settings.accountTitle")}
      organization="Acme Security"
      profile="Alex Morgan"
    >
      <PageHeader
        title={t("settings.accountTitle")}
        description={t("settings.accountDescription")}
      />
      {preview && (
        <FormMessage variant="info">{t("settings.previewNotice")}</FormMessage>
      )}
      <Tabs defaultValue={tab} className="min-w-0">
        <TabsList aria-label={t("settings.accountTitle")} className="mb-0 px-5">
          {(["general", "security", "api-keys", "notifications"] as const).map(
            (value) => (
              <TabsTrigger key={value} value={value}>
                {t(
                  value === "api-keys"
                    ? "settings.apiKeys"
                    : `settings.${value}`,
                )}
              </TabsTrigger>
            ),
          )}
        </TabsList>
        <TabsContent value="general">
          <Formik
            initialValues={{
              name: "Alex Morgan",
              timezone: "Europe/Sofia",
              language: "en",
            }}
            validate={profileValidator(t)}
            onSubmit={() => setPreview(true)}
          >
            <GeneralSettingsView
              email="alex@example.com"
              timezones={[
                "UTC",
                "Europe/Sofia",
                "Europe/London",
                "America/New_York",
              ]}
              error=""
              success=""
            />
          </Formik>
        </TabsContent>
        <TabsContent value="security">
          <div className="grid gap-5">
            <Card>
              <CardHeader
                title={t("settings.changePassword")}
                description={t("settings.changePasswordHint")}
              />
              <CardBody>
                <Formik
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validate={passwordValidator(t)}
                  onSubmit={() => setPreview(true)}
                >
                  <ChangePasswordFields error="" success="" />
                </Formik>
              </CardBody>
            </Card>
            <Formik
              initialValues={{ password: "", verifyCode: "" }}
              onSubmit={() => setPreview(true)}
            >
              <TwoFactorSettingsView
                isEnabled={false}
                step="idle"
                error=""
                success=""
                totpUri=""
                backupCodes={[]}
                onEnable={() => setPreview(true)}
                onDisable={() => setPreview(true)}
                onClose={() => {}}
              />
            </Formik>
          </div>
        </TabsContent>
        <TabsContent value="api-keys">
          <ApiKeyListView
            keys={keys}
            loading={false}
            onRetry={() => {}}
            onCreate={() => setPreview(true)}
            onRevoke={() => setPreview(true)}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSettings />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
function ProfileDemo({
  locale = "en",
  tab = "general",
}: {
  locale?: "en" | "bg";
  tab?: Tab;
}) {
  return (
    <I18nProvider key={locale} initialLocale={locale}>
      <ProfileContent tab={tab} />
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Profile",
  component: ProfileDemo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const General: Story = {};
export const Security: Story = { args: { tab: "security" } };
export const ApiKeys: Story = { args: { tab: "api-keys" } };
export const Notifications: Story = { args: { tab: "notifications" } };
export const Bulgarian: Story = { args: { locale: "bg" } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
export const CreateApiKey: Story = {
  render: () => (
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={{
          name: "",
          limitToOrganizations: false,
          organizationIds: [],
          permissions: {},
          expiresInDays: 90,
          rateLimitEnabled: true,
          rateLimitMax: 1000,
          rateLimitTimeWindow: 3600000,
        }}
        validate={toFormikValidation(createApiKeyFormSchema)}
        onSubmit={(_, helpers) =>
          helpers.setStatus("Preview only — no API key was created.")
        }
      >
        {({ status }) => (
          <ApiKeyFields
            visible
            onHide={() => {}}
            error={status ?? ""}
            organizations={[{ id: "demo", name: "Acme Security" }]}
          />
        )}
      </Formik>
    </I18nProvider>
  ),
};
export const AuthenticatorSetup: Story = {
  render: () => (
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={{ password: "", verifyCode: "" }}
        onSubmit={() => {}}
      >
        <TwoFactorSettingsView
          isEnabled={false}
          step="setup"
          error=""
          success=""
          totpUri="otpauth://totp/NextPhish:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=NextPhish"
          backupCodes={["DEMO-0001", "DEMO-0002", "DEMO-0003", "DEMO-0004"]}
          onEnable={() => {}}
          onDisable={() => {}}
          onClose={() => {}}
        />
      </Formik>
    </I18nProvider>
  ),
};
