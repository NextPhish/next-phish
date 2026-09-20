"use client";

import { trpc } from "@/src/lib/trpc";

export function useCampaignStatistics(campaignId: string) {
  return trpc.campaign.executionSummary.useQuery({ campaignId });
}

export type CampaignStatisticsModel = ReturnType<typeof useCampaignStatistics>;
