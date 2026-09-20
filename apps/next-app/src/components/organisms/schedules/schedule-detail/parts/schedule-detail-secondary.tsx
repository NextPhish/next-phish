"use client";

import { Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ScheduleDetail } from "./schedule-detail-content";
import { DetailItem } from "./schedule-detail-items";
import { enumLabel } from "./schedule-detail-label";

export function ScheduleDetailSecondary({
  data,
  formatDate,
}: Omit<
  {
    data: ScheduleDetail;
    formatDate: (value: Date | string | null) => string;
    onNavigate: (path: string) => void;
  },
  "onNavigate"
>) {
  const t = useTranslation();
  const recurrenceParts =
    data.type === "ONE_TIME"
      ? [t("scheduleUi.runsOnce")]
      : [
          data.frequency
            ? enumLabel(t, data.frequency)
            : t("scheduleUi.repeating"),
        ];
  if (data.weekday !== null)
    recurrenceParts.push(
      t("scheduleUi.detailWeekday", { value: data.weekday }),
    );
  if (data.dayOfMonth !== null)
    recurrenceParts.push(
      t("scheduleUi.detailDayOfMonth", { value: data.dayOfMonth }),
    );
  if (data.month !== null)
    recurrenceParts.push(t("scheduleUi.detailMonth", { value: data.month }));
  if (data.localTimeMinutes !== null)
    recurrenceParts.push(
      `${String(Math.floor(data.localTimeMinutes / 60)).padStart(2, "0")}:${String(data.localTimeMinutes % 60).padStart(2, "0")}`,
    );

  return (
    <div className="grid min-w-0 content-start gap-6">
      <Card>
        <CardHeader title={t("scheduleUi.recurrenceTitle")} />
        <CardBody className="pt-0">
          <dl className="grid gap-5 [&_dt]:text-xs [&_dt]:font-bold [&_dt]:uppercase [&_dt]:tracking-[0.04em] [&_dt]:text-[var(--np-muted)] [&_dd]:mt-[0.3rem] [&_dd]:mb-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-sm [&_dd]:font-[650] [&_dd]:text-[#192235] [&_p]:mt-[0.2rem] [&_p]:text-[0.78rem] [&_p]:text-[var(--np-muted)]">
            <DetailItem
              label={t("scheduleUi.pattern")}
              value={recurrenceParts.join(" · ")}
            />
            <DetailItem
              label={t("scheduleUi.selectionStrategy")}
              value={
                data.selectionStrategy
                  ? enumLabel(t, data.selectionStrategy)
                  : t("scheduleUi.notApplicable")
              }
              helper={
                data.selectionStrategy === "DECK"
                  ? data.shuffleDeck
                    ? t("scheduleUi.deckShuffled")
                    : t("scheduleUi.sourceOrder")
                  : undefined
              }
            />
            <DetailItem
              label={t("scheduleUi.maximumCampaigns")}
              value={data.maxCampaigns?.toString() ?? t("scheduleUi.noLimit")}
            />
            <DetailItem
              label={t("scheduleUi.ends")}
              value={formatDate(data.endsAt)}
            />
          </dl>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title={t("scheduleUi.metadataTitle")} />
        <CardBody className="pt-0">
          <dl className="grid gap-5 [&_dt]:text-xs [&_dt]:font-bold [&_dt]:uppercase [&_dt]:tracking-[0.04em] [&_dt]:text-[var(--np-muted)] [&_dd]:mt-[0.3rem] [&_dd]:mb-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-sm [&_dd]:font-[650] [&_dd]:text-[#192235] [&_p]:mt-[0.2rem] [&_p]:text-[0.78rem] [&_p]:text-[var(--np-muted)]">
            <DetailItem
              label={t("scheduleUi.createdBy")}
              value={data.createdBy.name || data.createdBy.email}
              helper={data.createdBy.email}
            />
            <DetailItem
              label={t("scheduleUi.created")}
              value={formatDate(data.createdAt)}
            />
            <DetailItem
              label={t("scheduleUi.lastUpdated")}
              value={formatDate(data.updatedAt)}
            />
            <DetailItem
              label={t("scheduleUi.completed")}
              value={formatDate(data.completedAt)}
            />
            <DetailItem
              label={t("scheduleUi.cancelled")}
              value={formatDate(data.cancelledAt)}
            />
            <DetailItem label={t("scheduleUi.scheduleId")} value={data.id} />
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
