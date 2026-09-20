"use client";

import { Suspense } from "react";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { CampaignStatisticsModel } from "../hooks/use-campaign-statistics";
import DeliveryStatusChart from "./delivery-status-chart";

const deliveryColors: Record<string, string> = {
  PLANNED: "#64748B",
  QUEUED: "#29B8FF",
  DISPATCHING: "#8B5CF6",
  RETRYABLE: "#F59E0B",
  SENT: "#15E5D4",
  FAILED: "#EF4444",
  DELIVERY_UNKNOWN: "#F97316",
  CANCELLED: "#71717A",
};
function MetricCard({
  label,
  value,
  total,
  description,
  color,
}: {
  label: string;
  value: number;
  total: number;
  description: string;
  color: string;
}) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <article className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--np-muted)]">
          {label}
        </p>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-3xl font-semibold text-[var(--np-ink)]">
        {value}
        <span className="ml-1 text-base font-normal text-[var(--np-muted)]">
          / {total}
        </span>
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--np-ink)]">
        {percentage}%
      </p>
      <p className="mt-3 text-xs leading-5 text-[var(--np-muted)]">
        {description}
      </p>
    </article>
  );
}

export function CampaignStatisticsView({
  summary,
}: {
  summary: Pick<CampaignStatisticsModel, "data" | "isLoading">;
}) {
  const t = useTranslation();

  if (summary.isLoading)
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {["sent", "opened", "clicked", "submitted", "reported"].map((key) => (
          <Skeleton
            key={key}
            style={{ height: "11rem", borderRadius: "1rem" }}
          />
        ))}
      </div>
    );

  if (!summary.data)
    return (
      <p className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-6 text-sm text-[var(--np-muted)]">
        {t("campaignsUi.statisticsUnavailable")}
      </p>
    );

  const deliveryCounts = Object.fromEntries(
    summary.data.delivery.map((item) => [
      item.deliveryStatus,
      item._count._all,
    ]),
  );
  const negativeCounts = Object.fromEntries(
    summary.data.negative.map((item) => [
      item.highestNegativeEvent,
      item._count._all,
    ]),
  );
  const total =
    summary.data.campaign.expectedRecipientCount ??
    Object.values(deliveryCounts).reduce((sum, count) => sum + count, 0);
  const sent = deliveryCounts.SENT ?? 0;
  const opened =
    (negativeCounts.OPENED ?? 0) +
    (negativeCounts.CLICKED ?? 0) +
    (negativeCounts.SUBMITTED ?? 0);
  const clicked =
    (negativeCounts.CLICKED ?? 0) + (negativeCounts.SUBMITTED ?? 0);
  const submitted = negativeCounts.SUBMITTED ?? 0;
  const deliveryEntries = Object.entries(deliveryCounts).filter(
    ([, count]) => count > 0,
  );
  const chartData = deliveryEntries.map(([status, count]) => ({
    name: t(
      status in deliveryColors
        ? `campaignsUi.deliveryStatuses.${status}`
        : "campaignsUi.unknownDelivery",
    ),
    value: count,
    color: deliveryColors[status] ?? "#64748B",
  }));
  return (
    <div className="space-y-6">
      <section aria-labelledby="engagement-summary-heading">
        <div>
          <h2
            id="engagement-summary-heading"
            className="text-lg font-semibold text-[var(--np-ink)]"
          >
            {t("campaignsUi.engagementSummary")}
          </h2>
          <p className="mt-1 text-sm text-[var(--np-muted)]">
            {t("campaignsUi.engagementDescription")}
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label={t("campaignsUi.emailsSent")}
            value={sent}
            total={total}
            description={t("campaignsUi.sentDescription")}
            color="#15E5D4"
          />
          <MetricCard
            label={t("campaignsUi.opened")}
            value={opened}
            total={total}
            description={t("campaignsUi.openedDescription")}
            color="#8B5CF6"
          />
          <MetricCard
            label={t("campaignsUi.clicked")}
            value={clicked}
            total={total}
            description={t("campaignsUi.clickedDescription")}
            color="#29B8FF"
          />
          <MetricCard
            label={t("campaignsUi.submitted")}
            value={submitted}
            total={total}
            description={t("campaignsUi.submittedDescription")}
            color="#F59E0B"
          />
          <MetricCard
            label={t("campaignsUi.reported")}
            value={summary.data.reported}
            total={total}
            description={t("campaignsUi.reportedDescription")}
            color="#EF4444"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5">
        <h2 className="text-lg font-semibold text-[var(--np-ink)]">
          {t("campaignsUi.deliveryStatus")}
        </h2>
        <p className="mt-1 text-sm text-[var(--np-muted)]">
          {t("campaignsUi.deliveryDescription")}
        </p>
        {deliveryEntries.length ? (
          <div className="mt-5 h-80">
            <Suspense fallback={<Skeleton className="h-full rounded-xl" />}>
              <DeliveryStatusChart data={chartData} />
            </Suspense>
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-[var(--np-border)] px-5 py-10 text-center text-sm text-[var(--np-muted)]">
            {t("campaignsUi.deliveryEmpty")}
          </p>
        )}
      </section>
    </div>
  );
}
