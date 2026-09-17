"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n/client";
import {
  makeTimelineRange,
  buildTimelineRows,
  buildTimelineChartData,
  buildTimelineOptions,
} from "./schedule-timeline-data";
export type { TimelineRow } from "./schedule-timeline-data";
import {
  ScheduleTimelineV1View,
  ScheduleTimelineLegacyView,
} from "./schedule-timeline-views";

export interface ScheduleTimelineProps {
  variant?: "legacy" | "v1";
  locale?: string;
  labels?: {
    title: string;
    description: string;
    range: string;
    schedules: string;
    campaigns: string;
    empty: string;
    error: string;
  };
}

export function ScheduleTimeline({
  variant = "legacy",
  locale,
  labels,
}: ScheduleTimelineProps = {}) {
  const router = useRouter();
  const t = useTranslation();
  const range = useMemo(() => makeTimelineRange(), []);
  const { data, isLoading, error } =
    trpc.campaign.getScheduleTimeline.useQuery(range);
  const mediumDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale],
  );

  const rows = useMemo(() => buildTimelineRows(data, range), [data, range]);
  const chartData = useMemo(
    () => buildTimelineChartData(rows, variant, labels?.title),
    [rows, variant, labels?.title],
  );
  const options = useMemo(
    () =>
      buildTimelineOptions({
        rows,
        range,
        labels,
        variant,
        t,
        mediumDateFormatter,
        shortDateFormatter,
        onNavigate: (path) => router.push(path),
      }),
    [
      rows,
      range,
      labels,
      variant,
      t,
      mediumDateFormatter,
      shortDateFormatter,
      router,
    ],
  );

  if (variant === "v1" && labels) {
    return (
      <ScheduleTimelineV1View
        rows={rows}
        chartData={chartData}
        options={options}
        isLoading={isLoading}
        mediumDateFormatter={mediumDateFormatter}
        labels={labels}
        error={Boolean(error)}
      />
    );
  }
  return (
    <ScheduleTimelineLegacyView
      rows={rows}
      chartData={chartData}
      options={options}
      isLoading={isLoading}
      mediumDateFormatter={mediumDateFormatter}
    />
  );
}
