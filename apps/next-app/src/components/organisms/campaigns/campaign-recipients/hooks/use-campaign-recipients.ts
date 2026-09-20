"use client";

import { useCallback, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";

export function useCampaignRecipients(campaignId: string) {
  const { state, onStateChange } = useDataTableState({
    pagination: { pageIndex: 0, pageSize: 25 },
  });
  const [expanded, setExpanded] = useState<string[]>([]);
  const query = trpc.campaign.listRecipients.useQuery({
    campaignId,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
  });
  const onToggle = useCallback((id: string) => {
    setExpanded((ids) =>
      ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id],
    );
  }, []);
  return {
    rows: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    state,
    onStateChange,
    expanded,
    onToggle,
    loading: query.isLoading,
    error: Boolean(query.error),
    onRetry: () => void query.refetch(),
  };
}
