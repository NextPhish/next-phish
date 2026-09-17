"use client";

import { useMemo } from "react";
import { trpc } from "@/src/lib/trpc";
import {
  RecipientTimelinePresentation,
  type TimelineEvent,
} from "./recipient-timeline-presentation";

export function RecipientTimelineContainer({
  campaignId,
  recipientId,
  timeZone,
}: {
  campaignId: string;
  recipientId: string;
  timeZone: string;
}) {
  const input = {
    campaignId,
    campaignRecipientId: recipientId,
    limit: 200,
    offset: 0,
  };
  const campaign = trpc.campaign.listCampaignEvents.useQuery(input);
  const delivery = trpc.campaign.listDeliveryEvents.useQuery(input);
  const events = useMemo<TimelineEvent[]>(
    () =>
      [
        ...(campaign.data ?? []).map((event) => ({
          ...event,
          source: "Campaign" as const,
        })),
        ...(delivery.data ?? []).map((event) => ({
          ...event,
          source: "Delivery" as const,
        })),
      ].sort((a, b) => +new Date(a.occurredAt) - +new Date(b.occurredAt)),
    [campaign.data, delivery.data],
  );
  return (
    <RecipientTimelinePresentation
      events={events}
      timeZone={timeZone}
      loading={campaign.isLoading || delivery.isLoading}
      error={Boolean(campaign.error || delivery.error)}
      onRetry={() => {
        void campaign.refetch();
        void delivery.refetch();
      }}
    />
  );
}
