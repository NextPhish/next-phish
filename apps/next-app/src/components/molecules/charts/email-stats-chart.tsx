"use client";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@next-phish/ui";
import type { OrganizationAnalyticsMonth } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./chart.module.css";
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
  ["sent", "charts.sent", "#4c79c9"],
  ["opened", "charts.opened", "#16877a"],
  ["clicked", "charts.clicked", "#5b4bdb"],
  ["submitted", "charts.submitted", "#9a4da0"],
  ["reported", "charts.reported", "#b46b19"],
  ["failed", "charts.errored", "#c94747"],
] as const;
interface Props {
  months: OrganizationAnalyticsMonth[];
  loading?: boolean;
  variant?: "legacy" | "v1";
}
export function EmailStatsChart({
  months,
  loading,
  variant = "legacy",
}: Props) {
  const t = useTranslation();
  const isV1 = variant === "v1";
  const data = useMemo(
    () =>
      months.map((item) => ({
        month: t(monthKeys[Number(item.month.slice(5, 7)) - 1] ?? "charts.jan"),
        ...Object.fromEntries(series.map(([field]) => [field, item[field]])),
      })),
    [months, t],
  );
  const axis = isV1 ? "#626d80" : "#a1a1aa";
  const grid = isV1 ? "rgba(98,109,128,.12)" : "rgba(255,255,255,.08)";
  const title = t("charts.emailStatsLast6Months");
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
          <Skeleton style={{ width: "100%", height: 250 }} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, bottom: 0, left: -16 }}
              accessibilityLayer
            >
              <CartesianGrid stroke={grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: axis, fontSize: 11 }}
                axisLine={{ stroke: grid }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ color: axis, fontSize: 11 }} />
              {series.map(([field, label, color]) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  name={t(label)}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
