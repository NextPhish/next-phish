"use client";

import { Skeleton } from "@next-phish/ui";
import { useCampaignDetail } from "./hooks/use-campaign-detail";
import { CampaignDetailView } from "./parts/campaign-detail-view";
import { CampaignDetailContent } from "./parts/detail-overview";
import { CampaignStatistics } from "../campaign-statistics";
import { CampaignRecipients } from "../campaign-recipients";

export function CampaignDetail({ id, saved }: { id: string; saved?: string }) {
  const model = useCampaignDetail(id, saved);
  if (model.isLoading)
    return <Skeleton style={{ height: "34rem", borderRadius: "1rem" }} />;
  if (!model.data)
    return (
      <p className="p-8 text-[var(--np-muted)]">
        {model.t("campaignsUi.notFound")}
      </p>
    );
  const data = model.data;
  return (
    <CampaignDetailView
      name={data.name}
      type={data.type}
      status={data.status}
      statusLabel={model.statusLabel}
      statusTone={model.statusTone}
      savedMessage={model.savedMessage}
      actionStatus={model.actionStatus}
      pending={model.pending}
      deleteOpen={model.deleteOpen}
      onDeleteOpenChange={model.onDeleteOpenChange}
      onEdit={model.onEdit}
      onSchedule={model.onSchedule}
      onAction={model.onAction}
      onDelete={model.onDelete}
      overview={
        <CampaignDetailContent
          data={data}
          recipientCount={model.recipientCount}
          schedules={model.schedules}
          onNavigate={model.onNavigate}
        />
      }
      statistics={<CampaignStatistics campaignId={id} />}
      recipients={
        <CampaignRecipients campaignId={id} timeZone={data.targetTimezone} />
      }
    />
  );
}
