"use client";

import { useCampaignList } from "./hooks/use-campaign-list";
import { CampaignListView } from "./parts/campaign-list-view";

export function CampaignList() {
  const model = useCampaignList();
  return <CampaignListView {...model} />;
}
