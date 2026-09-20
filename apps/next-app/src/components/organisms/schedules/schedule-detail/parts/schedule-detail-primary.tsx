"use client";

import { ArrowRight } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ScheduleDetail } from "./schedule-detail-content";
import { DetailItem } from "./schedule-detail-items";
import { enumLabel } from "./schedule-detail-label";

export function ScheduleDetailPrimary({
  data,
  formatDate,
  onNavigate,
}: {
  data: ScheduleDetail;
  formatDate: (value: Date | string | null) => string;
  onNavigate: (path: string) => void;
}) {
  const t = useTranslation();
  const deliverySummary =
    data.deliveryMode === "DRIP"
      ? t("scheduleUi.dripSummary", { count: data.dripEmailsPerMinute ?? "—" })
      : data.deliveryMode === "BATCH"
        ? t("scheduleUi.batchSummary", {
            count: data.batchSize ?? "—",
            minutes: data.batchIntervalMinutes ?? "—",
          })
        : t("scheduleUi.blastSummary");
  return (
    <div className="grid min-w-0 content-start gap-6">
      <Card>
        <CardHeader
          title={t("scheduleUi.detailOverviewTitle")}
          description={t("scheduleUi.detailOverviewDescription")}
        />
        <CardBody className="pt-0">
          <dl className="grid grid-cols-1 gap-6 min-[561px]:grid-cols-2 [&_dt]:text-xs [&_dt]:font-bold [&_dt]:uppercase [&_dt]:tracking-[0.04em] [&_dt]:text-[var(--np-muted)] [&_dd]:mt-[0.3rem] [&_dd]:mb-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-sm [&_dd]:font-[650] [&_dd]:text-[#192235] [&_p]:mt-[0.2rem] [&_p]:text-[0.78rem] [&_p]:text-[var(--np-muted)]">
            <DetailItem
              label={t("scheduleUi.firstOccurrence")}
              value={formatDate(data.startsAt)}
            />
            <DetailItem
              label={t("scheduleUi.nextOccurrence")}
              value={formatDate(data.nextOccurrenceAt)}
            />
            <DetailItem
              label={t("scheduleUi.timezone")}
              value={data.targetTimezone}
            />
            <DetailItem
              label={t("scheduleUi.delivery")}
              value={enumLabel(t, data.deliveryMode)}
              helper={deliverySummary}
            />
            <DetailItem
              label={t("scheduleUi.targetGroup")}
              value={data.targetGroup?.name ?? t("scheduleUi.inheritedTarget")}
              helper={
                data.targetGroup
                  ? t("scheduleUi.recipientCount", {
                      count: data.targetGroup._count?.users ?? 0,
                    })
                  : undefined
              }
            />
            <DetailItem
              label={t("scheduleUi.detailAutoComplete")}
              value={
                data.autoCompleteAfterDays
                  ? t("scheduleUi.daysAfterStart", {
                      count: data.autoCompleteAfterDays,
                    })
                  : t("scheduleUi.disabled")
              }
            />
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("scheduleUi.sourcesTitle")}
          description={t("scheduleUi.sourcesDescription")}
        />
        <CardBody className="grid gap-3 pt-0">
          {data.sources.map((source, index) => (
            <article
              key={source.campaignId}
              className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--np-border)] px-4 py-[0.9rem] min-[561px]:flex-row min-[561px]:items-center [&>div]:flex [&>div]:min-w-0 [&>div]:flex-wrap [&>div]:items-center [&>div]:gap-2 [&_h3]:text-sm [&_h3]:font-bold [&>button]:shrink-0 [&>button]:whitespace-nowrap [&_p]:ml-8 [&_p]:basis-full [&_p]:text-[0.78rem] [&_p]:text-[var(--np-muted)]"
            >
              <div>
                <span className="text-xs font-bold text-[var(--np-muted)]">
                  #{index + 1}
                </span>
                <h3>{source.campaign.name}</h3>
                <Badge>{enumLabel(t, source.campaign.type)}</Badge>
                <p>
                  {enumLabel(t, source.campaign.status)} ·{" "}
                  {t("scheduleUi.updated")}{" "}
                  {formatDate(source.campaign.updatedAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(`/campaigns/${source.campaignId}`)}
              >
                {t("scheduleUi.viewCampaign")}
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </article>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
