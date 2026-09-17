import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignDetailPresentation } from "../../../../apps/next-app/src/components/organisms/campaigns/detail-presentation";
import { CampaignDetailContent } from "../../../../apps/next-app/src/components/organisms/campaigns/detail-overview";

type CampaignDetail = ComponentProps<typeof CampaignDetailContent>["data"];
type CampaignSchedule = ComponentProps<
  typeof CampaignDetailContent
>["schedules"][number];

const schedule = {
  id: "schedule-1",
  name: "Quarterly security awareness",
  status: "PENDING_START",
  startsAt: new Date("2026-09-20T06:30:00Z"),
  targetTimezone: "Europe/Sofia",
  deliveryMode: "BATCH",
} as unknown as CampaignSchedule;

const campaign = {
  id: "campaign-1",
  name: "Quarterly security awareness",
  type: "CONCRETE",
  status: "PUBLISHED",
  tags: ["security", "quarterly", "onboarding"],
  targetTimezone: "Europe/Sofia",
  autoCompleteAfterDays: 20,
  createdAt: new Date("2026-09-01T08:15:00Z"),
  updatedAt: new Date("2026-09-10T11:40:00Z"),
  createdBy: { id: "user-1", name: "Maya Petrova", email: "maya@example.com" },
  sourceCampaign: { id: "campaign-template", name: "Awareness template" },
  _count: { clones: 2 },
  emailTemplate: {
    id: "email-1",
    name: "Password expiry notice",
    status: "ACTIVE",
    tags: ["security", "credentials"],
  },
  page: {
    id: "page-1",
    name: "Company sign-in",
    status: "ACTIVE",
    type: "LANDING",
  },
  mailSendingProfile: {
    id: "profile-1",
    name: "Security team",
    providerType: "SMTP",
    fromName: "Security Team",
    fromEmail: "security@example.com",
  },
  targetGroup: {
    id: "group-1",
    name: "All employees",
    status: "ACTIVE",
    _count: { users: 248 },
  },
  schedule,
  scheduleSources: [],
  brokenAt: null,
  brokenReason: null,
} as unknown as CampaignDetail;

function StatisticsFixture() {
  const metrics = [
    { label: "Emails sent", value: 231, color: "#15E5D4" },
    { label: "Opened", value: 117, color: "#8B5CF6" },
    { label: "Clicked", value: 42, color: "#29B8FF" },
    { label: "Submitted", value: 8, color: "#F59E0B" },
    { label: "Reported", value: 14, color: "#EF4444" },
  ];
  return (
    <section
      aria-label="Campaign statistics preview"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--np-muted)]">
              {metric.label}
            </p>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: metric.color }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 text-3xl font-semibold">
            {metric.value}
            <span className="ml-1 text-base font-normal text-[var(--np-muted)]">
              / 248
            </span>
          </p>
          <p className="mt-1 text-sm font-medium">
            {Math.round((metric.value / 248) * 100)}%
          </p>
        </article>
      ))}
    </section>
  );
}

function Preview({ template = false }: { template?: boolean }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <I18nProvider initialLocale="en">
      <CampaignDetailPresentation
        name={campaign.name}
        type={template ? "TEMPLATE" : campaign.type}
        status={campaign.status}
        statusLabel="Published"
        statusTone="success"
        savedMessage=""
        actionStatus={{ type: "idle", message: "" }}
        pending={{
          publish: false,
          pause: false,
          resume: false,
          complete: false,
          clone: false,
          delete: false,
        }}
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
        onAction={() => undefined}
        onDelete={() => undefined}
        onEdit={() => undefined}
        onSchedule={() => undefined}
        overview={
          <CampaignDetailContent
            data={
              template
                ? {
                    ...campaign,
                    type: "TEMPLATE",
                    targetGroup: null,
                    sourceCampaign: null,
                  }
                : campaign
            }
            recipientCount={template ? 0 : 248}
            schedules={template ? [] : [schedule]}
            onNavigate={() => undefined}
          />
        }
        statistics={<StatisticsFixture />}
        recipients={
          <div className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-6">
            Recipient delivery and event history
          </div>
        }
      />
    </I18nProvider>
  );
}

const meta = {
  title: "Screens/Campaigns/Detail",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
export const PublishedConcreteCampaign: StoryObj<typeof meta> = {};
export const Mobile: StoryObj<typeof meta> = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};

export const PublishedTemplate: StoryObj<typeof meta> = {
  args: { template: true },
};
