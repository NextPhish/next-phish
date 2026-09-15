"use client";

import styles from "./chart.module.css";

import { Chart } from "primereact/chart";
import { Skeleton } from "primereact/skeleton";
import { Skeleton as V1Skeleton } from "@next-phish/ui";
import type { OrganizationAnalyticsMonth } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      ticks: { color: "rgba(255,255,255,0.5)", font: { size: 11 } },
      grid: { color: "rgba(255,255,255,0.06)" },
      border: { color: "rgba(255,255,255,0.1)" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "rgba(255,255,255,0.5)",
        font: { size: 11 },
        precision: 0,
      },
      grid: { color: "rgba(255,255,255,0.06)" },
      border: { display: false },
    },
  },
};

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

interface CampaignsChartProps {
  months: OrganizationAnalyticsMonth[];
  loading?: boolean;
  variant?: "legacy" | "v1";
}

export function CampaignsChart({
  months,
  loading,
  variant = "legacy",
}: CampaignsChartProps) {
  const t = useTranslation();
  const labels = months.map((item) => {
    const monthIndex = Number(item.month.slice(5, 7)) - 1;
    return t(monthKeys[monthIndex] ?? "charts.jan");
  });
  const data = {
    labels,
    datasets: [
      {
        label: t("charts.campaigns"),
        data: months.map((item) => item.campaigns),
        backgroundColor:
          variant === "v1"
            ? "rgba(91, 75, 219, .82)"
            : "rgba(41, 184, 255, 0.8)",
        borderColor: variant === "v1" ? "#5b4bdb" : "#29b8ff",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const isV1 = variant === "v1";
  const chartOptions = isV1
    ? {
        ...options,
        scales: {
          x: {
            ...options.scales.x,
            ticks: { color: "#626d80", font: { size: 11 } },
            grid: { color: "rgba(98,109,128,.12)" },
            border: { color: "rgba(98,109,128,.22)" },
          },
          y: {
            ...options.scales.y,
            ticks: { color: "#626d80", font: { size: 11 }, precision: 0 },
            grid: { color: "rgba(98,109,128,.12)" },
          },
        },
      }
    : options;
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
        {t("charts.campaignsLast6Months")}
      </h3>
      <div className={isV1 ? styles.canvas : "h-[250px]"}>
        {loading ? (
          isV1 ? (
            <V1Skeleton style={{ width: "100%", height: 250 }} />
          ) : (
            <Skeleton width="100%" height="250px" borderRadius="0.75rem" />
          )
        ) : (
          <Chart
            type="bar"
            data={data}
            options={chartOptions}
            style={isV1 ? { height: "100%" } : undefined}
          />
        )}
      </div>
    </div>
  );
}
