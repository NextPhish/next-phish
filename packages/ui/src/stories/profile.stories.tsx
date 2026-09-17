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
import { GeneralTabPresentation } from "../../../../apps/next-app/src/components/organisms/settings/general-tab-presentation";
import { ChangePasswordPresentation } from "../../../../apps/next-app/src/components/organisms/settings/change-password-presentation";
import { TwoFactorPresentation } from "../../../../apps/next-app/src/components/organisms/settings/two-factor/presentation";
import { NotificationsTab } from "../../../../apps/next-app/src/components/organisms/settings/notifications-tab";
import { ApiKeyListPresentation } from "../../../../apps/next-app/src/components/organisms/settings/api-key-list-presentation";
import { ApiKeyForm } from "../../../../apps/next-app/src/components/organisms/settings/api-key-form";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
import {
  profileValidator,
  passwordValidator,
} from "../../../../apps/next-app/src/components/organisms/settings/profile-validation";
import styles from "../../../../apps/next-app/src/components/organisms/settings/profile-settings.module.css";

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
      <Tabs defaultValue={tab} className={styles.tabs}>
        <TabsList
          aria-label={t("settings.accountTitle")}
          className={styles.tabList}
        >
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
            <GeneralTabPresentation
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
          <div className={styles.cardStack}>
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
                  <ChangePasswordPresentation error="" success="" />
                </Formik>
              </CardBody>
            </Card>
            <Formik
              initialValues={{ password: "", verifyCode: "" }}
              onSubmit={() => setPreview(true)}
            >
              <TwoFactorPresentation
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
          <ApiKeyListPresentation
            keys={keys}
            loading={false}
            onRetry={() => {}}
            onCreate={() => setPreview(true)}
            onRevoke={() => setPreview(true)}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
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
          <ApiKeyForm
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
        <TwoFactorPresentation
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
