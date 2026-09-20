"use client";

import { RecipientTimeline } from "../recipient-timeline";
import { useCampaignRecipients } from "./hooks/use-campaign-recipients";
import { CampaignRecipientsView } from "./parts/campaign-recipients-view";

export function CampaignRecipients({
  campaignId,
  timeZone,
}: {
  campaignId: string;
  timeZone: string;
}) {
  const model = useCampaignRecipients(campaignId);
  return (
    <CampaignRecipientsView
      {...model}
      timeZone={timeZone}
      renderTimeline={(recipientId) => (
        <RecipientTimeline
          campaignId={campaignId}
          recipientId={recipientId}
          timeZone={timeZone}
        />
      )}
    />
  );
}
