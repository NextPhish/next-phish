"use client";

import { useCallback, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";
import { CampaignRecipientsPresentation } from "./recipients-presentation";
import { RecipientTimelineContainer } from "./recipient-timeline-container";

export function CampaignRecipientsTab({
  campaignId,
  timeZone,
}: {
  campaignId: string;
  timeZone: string;
}) {
  const { state, onStateChange } = useDataTableState({
    pagination: { pageIndex: 0, pageSize: 25 },
  });
  const [expanded, setExpanded] = useState<string[]>([]);
  const query = trpc.campaign.listRecipients.useQuery({
    campaignId,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
  });
  const onToggle = useCallback(
    (id: string) =>
      setExpanded((ids) =>
        ids.includes(id)
          ? ids.filter((current) => current !== id)
          : [...ids, id],
      ),
    [],
  );
  return (
    <CampaignRecipientsPresentation
      timeZone={timeZone}
      rows={query.data?.rows ?? []}
      total={query.data?.total ?? 0}
      state={state}
      onStateChange={onStateChange}
      expanded={expanded}
      onToggle={onToggle}
      loading={query.isLoading}
      error={Boolean(query.error)}
      onRetry={() => void query.refetch()}
      renderTimeline={(recipientId) => (
        <RecipientTimelineContainer
          campaignId={campaignId}
          recipientId={recipientId}
          timeZone={timeZone}
        />
      )}
    />
  );
}
