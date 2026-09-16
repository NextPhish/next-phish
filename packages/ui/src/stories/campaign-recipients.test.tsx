import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { RecipientTimelinePresentation } from "../../../../apps/next-app/src/components/organisms/campaigns/recipient-timeline-presentation";

describe("campaign recipient timeline", () => {
  it("shows a localized retry for failed event queries", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="bg">
        <RecipientTimelinePresentation
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
        <RecipientTimelinePresentation
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
