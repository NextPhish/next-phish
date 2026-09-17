import type { Meta, StoryObj } from "@storybook/react-vite";
import type { OrganizationDashboardView } from "../../../backend/src/organization/types/organization.types";
import { DashboardPresentation } from "../../../../apps/next-app/src/components/organisms/dashboard/presentation";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { AppShell, Card, CardBody, CardHeader } from "../index";
import {
  LayoutDashboard,
  Zap,
  Users,
  Mail,
  CalendarDays,
  Send,
} from "lucide-react";

const populated: OrganizationDashboardView = {
  periodDays: 30,
  metrics: {
    activeCampaigns: 4,
    recipientsTargeted: 1280,
    delivered: 1242,
    deliveryRate: 97,
    riskRecipients: 147,
    riskRate: 11.5,
    reportedRecipients: 326,
    reportingRate: 25.5,
  },
  funnel: {
    scheduled: 1280,
    sent: 1242,
    opened: 894,
    clicked: 147,
    submitted: 42,
    reported: 326,
  },
  attention: {
    deliveryDisabled: false,
    brokenCampaigns: 1,
    failedDeliveries: 38,
  },
  readiness: {
    campaigns: 12,
    targetGroups: 6,
    emailTemplates: 8,
    pages: 4,
    sendingProfiles: 2,
  },
};
const empty: OrganizationDashboardView = {
  periodDays: 30,
  metrics: {
    activeCampaigns: 0,
    recipientsTargeted: 0,
    delivered: 0,
    deliveryRate: 0,
    riskRecipients: 0,
    riskRate: 0,
    reportedRecipients: 0,
    reportingRate: 0,
  },
  funnel: {
    scheduled: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    reported: 0,
  },
  attention: {
    deliveryDisabled: false,
    brokenCampaigns: 0,
    failedDeliveries: 0,
  },
  readiness: {
    campaigns: 0,
    targetGroups: 0,
    emailTemplates: 0,
    pages: 0,
    sendingProfiles: 0,
  },
};
function DashboardDemo({
  locale = "en",
  state = "populated",
}: {
  locale?: "en" | "bg";
  state?: "populated" | "getting-started" | "loading" | "error" | "no-activity";
}) {
  const bg = locale === "bg";
  const data =
    state === "getting-started"
      ? empty
      : state === "no-activity"
        ? { ...empty, readiness: populated.readiness }
        : populated;
  return (
    <I18nProvider key={locale} initialLocale={locale}>
      <AppShell
        activeItem="dashboard"
        breadcrumb={
          bg ? "Работно пространство / Табло" : "Workspace / Dashboard"
        }
        organization={<span>Acme Security</span>}
        profile={<span>Alex Morgan · Preview</span>}
        navigation={[
          {
            id: "overview",
            items: [
              {
                id: "dashboard",
                label: bg ? "Табло" : "Dashboard",
                href: "#dashboard",
                icon: <LayoutDashboard size={18} />,
              },
            ],
          },
          {
            id: "simulations",
            label: bg ? "Симулации" : "Simulations",
            items: [
              {
                id: "campaigns",
                label: bg ? "Кампании" : "Campaigns",
                href: "#campaigns",
                icon: <Zap size={18} />,
              },
              {
                id: "schedule",
                label: bg ? "График" : "Schedule",
                href: "#schedule",
                icon: <CalendarDays size={18} />,
              },
              {
                id: "target-groups",
                label: bg ? "Целеви групи" : "Target groups",
                href: "#target-groups",
                icon: <Users size={18} />,
              },
              {
                id: "email-templates",
                label: bg ? "Имейл шаблони" : "Email templates",
                href: "#email-templates",
                icon: <Mail size={18} />,
              },
              {
                id: "sending-profiles",
                label: bg ? "Профили за изпращане" : "Sending profiles",
                href: "#sending-profiles",
                icon: <Send size={18} />,
              },
            ],
          },
        ]}
      >
        <DashboardPresentation
          organizationName="Acme Security"
          data={data}
          isLoading={state === "loading"}
          error={
            state === "error"
              ? bg
                ? "Неуспешна връзка. Опитайте отново."
                : "Connection failed. Please try again."
              : undefined
          }
          timeline={
            <Card>
              <CardHeader
                title={bg ? "Тримесечен график" : "Three-month timeline"}
              />
              <CardBody>
                <p>
                  {bg
                    ? "Няма графици или активни кампании през следващите три месеца."
                    : "No schedules or running campaigns in the next three months."}
                </p>
              </CardBody>
            </Card>
          }
        />
      </AppShell>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Dashboard",
  component: DashboardDemo,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DashboardDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const GettingStarted: Story = { args: { state: "getting-started" } };
export const NoActivity: Story = { args: { state: "no-activity" } };
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Bulgarian: Story = { args: { locale: "bg" } };
export const Mobile: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
