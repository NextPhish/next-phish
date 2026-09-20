"use client";

import { useRecipientTimeline } from "./hooks/use-recipient-timeline";
import { RecipientTimelineView } from "./parts/recipient-timeline-view";

export function RecipientTimeline({
  campaignId,
  recipientId,
  timeZone,
}: {
  campaignId: string;
  recipientId: string;
  timeZone: string;
}) {
  const model = useRecipientTimeline(campaignId, recipientId);
  return <RecipientTimelineView {...model} timeZone={timeZone} />;
}
