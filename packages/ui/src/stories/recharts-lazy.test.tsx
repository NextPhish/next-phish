import { render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { CampaignStatisticsView } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-statistics/parts/campaign-statistics-view";
import type { CampaignStatisticsModel } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-statistics/hooks/use-campaign-statistics";
import { ScheduleTimelineV1View } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-timeline/parts/schedule-timeline-views";
import {
  CampaignsChart,
  EmailStatsChart,
} from "../../../../apps/next-app/src/components/molecules/charts";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const delivery = {
  campaign: {
    id: "campaign",
    status: "ACTIVE",
    materializedAt: new Date(),
    expectedRecipientCount: 100,
  },
  delivery: [{ deliveryStatus: "SENT", _count: { _all: 85 } }],
  negative: [{ highestNegativeEvent: "OPENED", _count: { _all: 42 } }],
  reported: 12,
} satisfies NonNullable<CampaignStatisticsModel["data"]>;

const months = [
  {
    month: "2026-09",
    campaigns: 4,
    sent: 100,
    opened: 42,
    clicked: 12,
    submitted: 3,
    reported: 8,
    failed: 2,
  },
];

it("resolves every lazy Recharts visualization to a responsive chart", async () => {
  const medium = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const short = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  const { container } = render(
    <I18nProvider initialLocale="en">
      <CampaignStatisticsView summary={{ data: delivery, isLoading: false }} />
      <ScheduleTimelineV1View
        rows={[
          {
            id: "schedule",
            kind: "schedule",
            label: "Awareness",
            status: "RUNNING",
            start: new Date("2026-09-05"),
            end: new Date("2026-10-05"),
          },
        ]}
        range={{
          startsAt: new Date("2026-09-01"),
          endsAt: new Date("2026-12-01"),
        }}
        isLoading={false}
        error={false}
        mediumDateFormatter={medium}
        shortDateFormatter={short}
        statusLabel={(status) => status}
        onRowNavigate={() => undefined}
        labels={{
          title: "Timeline",
          description: "Upcoming activity",
          range: "Three months",
          schedules: "Schedules",
          campaigns: "Campaigns",
          empty: "Empty",
          error: "Error",
        }}
      />
      <CampaignsChart months={months} variant="v1" />
      <EmailStatsChart months={months} variant="v1" />
    </I18nProvider>,
  );

  expect(screen.getByText("Delivery status")).toBeInTheDocument();
  await waitFor(() => {
    expect(
      container.querySelectorAll(".recharts-responsive-container"),
    ).toHaveLength(4);
  });
});
