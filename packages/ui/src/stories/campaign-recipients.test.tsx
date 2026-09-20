import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { RecipientTimelineView } from "../../../../apps/next-app/src/components/organisms/campaigns/recipient-timeline/parts/recipient-timeline-view";

describe("campaign recipient timeline", () => {
  it("shows a localized retry for failed event queries", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="bg">
        <RecipientTimelineView
          events={[]}
          loading={false}
          error
          onRetry={retry}
          timeZone="Europe/Sofia"
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Историята на събитията не може да бъде заредена.",
    );
    await user.click(screen.getByRole("button", { name: "Опитай отново" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("preserves event source, metadata, and campaign timezone", () => {
    render(
      <I18nProvider initialLocale="en">
        <RecipientTimelineView
          events={[
            {
              id: "event-1",
              source: "Delivery",
              type: "DELIVERED",
              occurredAt: "2026-09-20T09:30:00.000Z",
              metadata: { provider_id: "msg-1" },
            },
          ]}
          loading={false}
          error={false}
          onRetry={() => undefined}
          timeZone="Europe/Sofia"
        />
      </I18nProvider>,
    );
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Provider id:")).toBeInTheDocument();
    expect(screen.getByText("msg-1")).toBeInTheDocument();
    expect(screen.getByText(/12:30/)).toBeInTheDocument();
  });
});

import { useState } from "react";
import {
  CampaignRecipientsView,
  type Recipient,
} from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-recipients/parts/campaign-recipients-view";
import { useDataTableState } from "../hooks/use-data-table-state";

function RecipientsPreview() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const { state, onStateChange } = useDataTableState();
  const rows = ["Daniel", "Elena"].map((firstName, index) => ({
    id: String(index),
    firstName,
    lastName: "Demo",
    email: `${firstName}@example.test`,
    scheduledAt: new Date("2026-09-20T09:30:00.000Z"),
    position: null,
    sentAt: null,
    failedAt: null,
    highestNegativeEventAt: null,
    reportedAt: null,
    deliveryStatus: "SENT",
    highestNegativeEvent: "NONE",
    reported: false,
    attemptCount: 1,
  })) as Recipient[];
  return (
    <I18nProvider initialLocale="en">
      <CampaignRecipientsView
        rows={rows}
        total={rows.length}
        state={state}
        onStateChange={onStateChange}
        timeZone="Europe/Sofia"
        expanded={expanded}
        onToggle={(id) =>
          setExpanded((ids) =>
            ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
          )
        }
        loading={false}
        error={false}
        onRetry={() => {}}
        renderTimeline={(id) => <p>Timeline {id}</p>}
      />
    </I18nProvider>
  );
}

it("expands each history immediately after its recipient row and removes it on collapse", async () => {
  const user = userEvent.setup();
  render(<RecipientsPreview />);
  const firstRow = screen.getByText("Daniel Demo").closest("tr")!;
  const secondRow = screen.getByText("Elena Demo").closest("tr")!;
  await user.click(secondRow);
  await user.click(firstRow);
  const firstDetails = screen.getByText("Timeline 0").closest("tr")!;
  const secondDetails = screen.getByText("Timeline 1").closest("tr")!;
  expect(firstRow.nextElementSibling).toBe(firstDetails);
  expect(firstDetails.nextElementSibling).toBe(secondRow);
  expect(secondRow.nextElementSibling).toBe(secondDetails);
  expect(firstDetails.querySelector("td")).toHaveAttribute("colspan", "7");
  expect(firstRow).toHaveAttribute("aria-expanded", "true");
  firstRow.focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByText("Timeline 0")).not.toBeInTheDocument();
  expect(firstRow.nextElementSibling).toBe(secondRow);
  expect(screen.getByText("Timeline 1")).toBeVisible();
});
