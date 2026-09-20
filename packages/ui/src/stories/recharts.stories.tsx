import type { Meta, StoryObj } from "@storybook/react-vite";
import { CampaignStatisticsView } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-statistics/parts/campaign-statistics-view";
import type { CampaignStatisticsModel } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-statistics/hooks/use-campaign-statistics";
import { ScheduleTimelineV1View } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-timeline/parts/schedule-timeline-views";
import type { TimelineRow } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-timeline/parts/schedule-timeline-data";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import {
  CampaignsChart,
  EmailStatsChart,
} from "../../../../apps/next-app/src/components/molecules/charts";

const delivery = {
  campaign: {
    id: "campaign-1",
    status: "ACTIVE",
    materializedAt: new Date("2026-09-01T08:00:00Z"),
    expectedRecipientCount: 500,
  },
  delivery: [
    { deliveryStatus: "SENT", _count: { _all: 420 } },
    { deliveryStatus: "FAILED", _count: { _all: 35 } },
    { deliveryStatus: "QUEUED", _count: { _all: 45 } },
  ],
  negative: [
    { highestNegativeEvent: "OPENED", _count: { _all: 210 } },
    { highestNegativeEvent: "CLICKED", _count: { _all: 72 } },
    { highestNegativeEvent: "SUBMITTED", _count: { _all: 18 } },
  ],
  reported: 61,
} satisfies NonNullable<CampaignStatisticsModel["data"]>;

const range = {
  startsAt: new Date("2026-09-01T00:00:00Z"),
  endsAt: new Date("2026-12-01T00:00:00Z"),
};
const rows: TimelineRow[] = [
  {
    id: "schedule-1",
    kind: "schedule",
    label: "Quarterly awareness",
    status: "RUNNING",
    start: new Date("2026-09-05T00:00:00Z"),
    end: new Date("2026-11-20T00:00:00Z"),
  },
  {
    id: "campaign-1",
    kind: "campaign",
    label: "Credential refresh",
    status: "SCHEDULED",
    start: new Date("2026-09-22T00:00:00Z"),
    end: new Date("2026-10-12T00:00:00Z"),
  },
  {
    id: "campaign-2",
    kind: "campaign",
    label: "Invoice simulation",
    status: "RUNNING",
    start: new Date("2026-10-18T00:00:00Z"),
    end: new Date("2026-11-07T00:00:00Z"),
  },
];

function ChartPreview({ chart }: { chart: "delivery" | "timeline" }) {
  const medium = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
  const short = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return (
    <I18nProvider initialLocale="en">
      <div className="mx-auto max-w-5xl">
        {chart === "delivery" ? (
          <CampaignStatisticsView
            summary={{ data: delivery, isLoading: false }}
          />
        ) : (
          <ScheduleTimelineV1View
            rows={rows}
            range={range}
            isLoading={false}
            error={false}
            mediumDateFormatter={medium}
            shortDateFormatter={short}
            statusLabel={(status) => status}
            onRowNavigate={() => undefined}
            labels={{
              title: "Three-month timeline",
              description: "Upcoming schedules and running campaigns",
              range: "Sep–Nov 2026",
              schedules: "Schedules",
              campaigns: "Campaigns",
              empty: "No upcoming activity",
              error: "Timeline unavailable",
            }}
          />
        )}
      </div>
    </I18nProvider>
  );
}

const meta = {
  title: "Application/Recharts",
  component: ChartPreview,
} satisfies Meta<typeof ChartPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DeliveryDoughnut: Story = { args: { chart: "delivery" } };
export const ScheduleRangeBars: Story = { args: { chart: "timeline" } };

const months = [
  {
    month: "2026-08",
    campaigns: 2,
    sent: 100,
    opened: 40,
    clicked: 15,
    submitted: 5,
    reported: 20,
    failed: 3,
  },
  {
    month: "2026-09",
    campaigns: 3,
    sent: 150,
    opened: 65,
    clicked: 22,
    submitted: 8,
    reported: 30,
    failed: 2,
  },
];

export const OrganizationAnalytics: Story = {
  args: { chart: "delivery" },
  render: () => (
    <I18nProvider initialLocale="en">
      <div className="grid gap-4 lg:grid-cols-2">
        <CampaignsChart months={months} variant="v1" />
        <EmailStatsChart months={months} variant="v1" />
      </div>
    </I18nProvider>
  ),
};
