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
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "rgba(255,255,255,0.6)",
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
        font: { size: 11 },
      },
    },
  },
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

const series = [
  ["sent", "charts.sent", "#29b8ff", "rgba(41, 184, 255, 0.1)"],
  ["opened", "charts.opened", "#15e5d4", "rgba(21, 229, 212, 0.1)"],
  ["clicked", "charts.clicked", "#5c73ff", "rgba(92, 115, 255, 0.1)"],
  ["submitted", "charts.submitted", "#7b5cff", "rgba(123, 92, 255, 0.1)"],
  ["reported", "charts.reported", "#f59e0b", "rgba(245, 158, 11, 0.1)"],
  ["failed", "charts.errored", "#ef4444", "rgba(239, 68, 68, 0.1)"],
] as const;

interface EmailStatsChartProps {
  months: OrganizationAnalyticsMonth[];
  loading?: boolean;
  variant?: "legacy" | "v1";
}

export function EmailStatsChart({
  months,
  loading,
  variant = "legacy",
}: EmailStatsChartProps) {
  const t = useTranslation();
  const labels = months.map((item) => {
    const monthIndex = Number(item.month.slice(5, 7)) - 1;
    return t(monthKeys[monthIndex] ?? "charts.jan");
  });
  const data = {
    labels,
    datasets: series.map(
      ([field, label, borderColor, backgroundColor], index) => ({
        label: t(label),
        data: months.map((item) => item[field]),
        borderColor:
          variant === "v1"
            ? [
                "#5b4bdb",
                "#16877a",
                "#4c79c9",
                "#9a4da0",
                "#b46b19",
                "#c94747",
              ][index]
            : borderColor,
        backgroundColor:
          variant === "v1"
            ? [
                "rgba(91,75,219,.1)",
                "rgba(22,135,122,.1)",
                "rgba(76,121,201,.1)",
                "rgba(154,77,160,.1)",
                "rgba(180,107,25,.1)",
                "rgba(201,71,71,.1)",
              ][index]
            : backgroundColor,
        tension: 0.3,
      }),
    ),
  };

  const isV1 = variant === "v1";
  const chartOptions = isV1
    ? {
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            ...options.plugins.legend,
            labels: { ...options.plugins.legend.labels, color: "#626d80" },
          },
        },
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
        {t("charts.emailStatsLast6Months")}
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
            type="line"
            data={data}
            options={chartOptions}
            style={isV1 ? { height: "100%" } : undefined}
          />
        )}
      </div>
    </div>
  );
}
