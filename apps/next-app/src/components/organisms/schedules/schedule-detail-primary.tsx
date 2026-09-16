"use client";

import { ArrowRight } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ScheduleDetail } from "./schedule-detail-content";
import { DetailItem } from "./schedule-detail-items";
import { enumLabel } from "./schedule-detail-label";
import styles from "./schedule-detail.module.css";

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
    <div className={styles.primaryColumn}>
      <Card>
        <CardHeader
          title={t("scheduleUi.detailOverviewTitle")}
          description={t("scheduleUi.detailOverviewDescription")}
        />
        <CardBody className="pt-0">
          <dl className={styles.detailGrid}>
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
        <CardBody className={`pt-0 ${styles.sourceList}`}>
          {data.sources.map((source, index) => (
            <article key={source.campaignId} className={styles.source}>
              <div>
                <span className={styles.position}>#{index + 1}</span>
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
