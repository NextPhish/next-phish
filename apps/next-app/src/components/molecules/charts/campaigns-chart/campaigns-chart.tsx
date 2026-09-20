"use client";

import { Suspense, useMemo } from "react";
import { Skeleton } from "@next-phish/ui";
import type { OrganizationAnalyticsMonth } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";
import styles from "../chart.module.css";
import Visualization from "./parts/campaigns-chart-visualization";
const monthKeys = [
  "charts.jan",
  "charts.feb",
  "charts.mar",
  "charts.apr",
  "charts.may",
  "charts.jun",
  "charts.jul",
  "charts.aug",
  "charts.sep",
  "charts.oct",
  "charts.nov",
  "charts.dec",
] as const;
interface Props {
  months: OrganizationAnalyticsMonth[];
  loading?: boolean;
  variant?: "legacy" | "v1";
}
const ChartSkeleton = () => <Skeleton style={{ width: "100%", height: 250 }} />;

export function CampaignsChart({ months, loading, variant = "legacy" }: Props) {
  const t = useTranslation();
  const isV1 = variant === "v1";
  const data = useMemo(
    () =>
      months.map((item) => ({
        month: t(monthKeys[Number(item.month.slice(5, 7)) - 1] ?? "charts.jan"),
        campaigns: item.campaigns,
      })),
    [months, t],
  );
  const axis = isV1 ? "#626d80" : "#a1a1aa";
  const grid = isV1 ? "rgba(98,109,128,.12)" : "rgba(255,255,255,.08)";
  const title = t("charts.campaignsLast6Months");
  return (
    <div
      className={
        isV1
          ? `np-card ${styles.card}`
          : "rounded-xl border border-white/10 bg-brand-dark p-5"
      }
    >
      <h3
        className={
          isV1 ? styles.heading : "mb-4 text-sm font-semibold text-zinc-200"
        }
      >
        {title}
      </h3>
      <div
        className={isV1 ? styles.canvas : "h-[250px]"}
        role="img"
        aria-label={title}
      >
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Suspense fallback={<ChartSkeleton />}>
            <Visualization
              data={data}
              axis={axis}
              grid={grid}
              seriesName={t("charts.campaigns")}
              fill={isV1 ? "#5b4bdb" : "#29b8ff"}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
