import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays } from "lucide-react";
import {
  ScheduleDetailContent,
  type ScheduleDetail,
} from "../../../../apps/next-app/src/components/organisms/schedules/schedule-detail/parts/schedule-detail-content";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { AppShell, Badge, FormMessage, PageHeader } from "../index";

export const populatedSchedule = {
  id: "schedule-awareness-2026",
  name: "Quarterly awareness programme",
  type: "RECURRING",
  status: "SCHEDULED",
  targetTimezone: "Europe/Sofia",
  startsAt: new Date("2026-09-21T06:00:00.000Z"),
  nextOccurrenceAt: new Date("2026-12-21T07:00:00.000Z"),
  endsAt: new Date("2027-09-21T06:00:00.000Z"),
  completedAt: null,
  cancelledAt: null,
  createdAt: new Date("2026-08-28T09:15:00.000Z"),
  updatedAt: new Date("2026-09-14T11:30:00.000Z"),
  deliveryMode: "BATCH",
  dripEmailsPerMinute: null,
  batchSize: 50,
  batchIntervalMinutes: 15,
  autoCompleteAfterDays: 20,
  frequency: "QUARTERLY",
  weekday: null,
  dayOfMonth: 21,
  month: null,
  localTimeMinutes: 540,
  selectionStrategy: "DECK",
  shuffleDeck: true,
  maxCampaigns: 8,
  brokenReason: null,
  targetGroup: {
    id: "group-all",
    name: "All employees",
    _count: { users: 248 },
  },
  createdBy: {
    id: "user-alex",
    name: "Alex Morgan",
    email: "alex@example.com",
  },
  sources: [
    {
      campaignId: "source-passwords",
      position: 0,
      campaign: {
        id: "source-passwords",
        name: "Password reset warning",
        type: "TEMPLATE",
        status: "PUBLISHED",
        updatedAt: new Date("2026-09-10T08:00:00.000Z"),
      },
    },
    {
      campaignId: "source-invoice",
      position: 1,
      campaign: {
        id: "source-invoice",
        name: "Unexpected invoice",
        type: "TEMPLATE",
        status: "PUBLISHED",
        updatedAt: new Date("2026-09-12T13:20:00.000Z"),
      },
    },
  ],
  campaigns: [
    {
      id: "campaign-september",
      name: "September awareness",
      status: "ACTIVE",
      occurrenceAt: new Date("2026-09-21T06:00:00.000Z"),
    },
    {
      id: "campaign-june",
      name: "June awareness",
      status: "COMPLETED",
      occurrenceAt: new Date("2026-06-22T06:00:00.000Z"),
    },
  ],
} as unknown as ScheduleDetail;

export function ScheduleDetailPreview({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) {
  const [destination, setDestination] = useState("");
  const navigate = (path: string) => {
    setDestination(path);
    onNavigate?.(path);
  };
  return (
    <AppShell
      navigation={[
        {
          id: "planning",
          label: "Planning",
          items: [
            {
              id: "schedule",
              label: "Schedule",
              href: "#schedule",
              icon: <CalendarDays size={18} />,
            },
          ],
        },
      ]}
      activeItem="schedule"
      breadcrumb="Schedule overview"
      profile={<span>Alex Morgan</span>}
    >
      {destination && (
        <FormMessage variant="info">
          Preview navigation: {destination}
        </FormMessage>
      )}
      <PageHeader
        title={populatedSchedule.name}
        description="Recurring schedule · Europe/Sofia"
        actions={<Badge tone="info">Scheduled</Badge>}
      />
      <ScheduleDetailContent data={populatedSchedule} onNavigate={navigate} />
    </AppShell>
  );
}

const meta = {
  title: "Screens/Schedule/Detail",
  component: ScheduleDetailPreview,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <I18nProvider initialLocale="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof ScheduleDetailPreview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const PopulatedRecurringSchedule: Story = {};
