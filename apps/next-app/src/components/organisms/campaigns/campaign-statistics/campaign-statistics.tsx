"use client";

import { useCampaignStatistics } from "./hooks/use-campaign-statistics";
import { CampaignStatisticsView } from "./parts/campaign-statistics-view";

export function CampaignStatistics({ campaignId }: { campaignId: string }) {
  return <CampaignStatisticsView summary={useCampaignStatistics(campaignId)} />;
}
