import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/router";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

const DAY_MS = 86_400_000;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function endFromDays(start: Date, days: number | null): Date {
  return new Date(start.getTime() + (days ?? 20) * DAY_MS);
}

export type TimelineRow = {
  id: string;
  kind: "schedule" | "campaign";
  label: string;
  status: string;
  start: Date;
  end: Date;
};

export type TimelineData =
  inferRouterOutputs<AppRouter>["campaign"]["getScheduleTimeline"];
export type TimelineRange = { startsAt: Date; endsAt: Date };

export function makeTimelineRange(): TimelineRange {
  const startsAt = new Date();
  startsAt.setHours(0, 0, 0, 0);
  return { startsAt, endsAt: addMonths(startsAt, 3) };
}

export function buildTimelineRows(
  data: TimelineData | undefined,
  range: TimelineRange,
): TimelineRow[] {
  if (!data) return [];
  const schedules = data.schedules.map((schedule) => {
    const start = new Date(
      Math.max(new Date(schedule.startsAt).getTime(), range.startsAt.getTime()),
    );
    const naturalEnd = schedule.endsAt
      ? new Date(schedule.endsAt)
      : schedule.type === "ONE_TIME"
        ? endFromDays(
            new Date(schedule.startsAt),
            schedule.autoCompleteAfterDays,
          )
        : range.endsAt;
    return {
      id: schedule.id,
      kind: "schedule" as const,
      label: schedule.name,
      status: schedule.status,
      start,
      end: new Date(Math.min(naturalEnd.getTime(), range.endsAt.getTime())),
    };
  });
  const campaigns = data.campaigns.map((campaign) => {
    const occurrence = new Date(campaign.occurrenceAt ?? campaign.createdAt);
    return {
      id: campaign.id,
      kind: "campaign" as const,
      label: campaign.name,
      status: campaign.status,
      start: new Date(Math.max(occurrence.getTime(), range.startsAt.getTime())),
      end: new Date(
        Math.min(
          endFromDays(occurrence, campaign.autoCompleteAfterDays).getTime(),
          range.endsAt.getTime(),
        ),
      ),
    };
  });
  return [...schedules, ...campaigns]
    .filter((row) => row.end > row.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function buildTimelineChartData(
  rows: TimelineRow[],
  variant: "legacy" | "v1",
  title?: string,
): ChartData<"bar", [number, number][], string> {
  return {
    labels: rows.map((row) => row.label),
    datasets: [
      {
        label: title ?? "Timeline",
        data: rows.map((row) => [row.start.getTime(), row.end.getTime()]),
        backgroundColor: rows.map((row) =>
          row.kind === "schedule"
            ? variant === "v1"
              ? "rgba(109, 96, 220, 0.78)"
              : "rgba(41, 184, 255, 0.78)"
            : variant === "v1"
              ? "rgba(74, 179, 165, 0.78)"
              : "rgba(21, 229, 212, 0.78)",
        ),
        borderColor: rows.map((row) =>
          row.kind === "schedule"
            ? variant === "v1"
              ? "#5146d9"
              : "#29B8FF"
            : variant === "v1"
              ? "#328e81"
              : "#15E5D4",
        ),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 18,
      },
    ],
  };
}

export function buildTimelineOptions({
  rows,
  range,
  labels,
  variant,
  t,
  mediumDateFormatter,
  shortDateFormatter,
  onNavigate,
}: {
  rows: TimelineRow[];
  range: TimelineRange;
  labels?: { schedules: string; campaigns: string };
  variant: "legacy" | "v1";
  t: TranslationFunction;
  mediumDateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  onNavigate: (path: string) => void;
}): ChartOptions<"bar"> {
  return {
    indexAxis: "y",
    maintainAspectRatio: false,
    animation: false,
    onClick: (_event, elements) => {
      const row = rows[elements[0]?.index ?? -1];
      if (row)
        onNavigate(
          row.kind === "schedule"
            ? `/schedule/${row.id}`
            : `/campaigns/${row.id}`,
        );
    },
    interaction: { intersect: false, mode: "nearest" },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const row = rows[context.dataIndex];
            if (!row) return "";
            const kindLabel =
              row.kind === "schedule"
                ? (labels?.schedules ?? "Schedule")
                : (labels?.campaigns ?? "Campaign");
            return `${kindLabel} · ${t(`scheduleUi.values.${row.status}`)} · ${mediumDateFormatter.format(row.start)} – ${mediumDateFormatter.format(row.end)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: range.startsAt.getTime(),
        max: range.endsAt.getTime(),
        grid: {
          color:
            variant === "v1"
              ? "rgba(25, 34, 53, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
        },
        border: {
          color:
            variant === "v1"
              ? "rgba(25, 34, 53, 0.14)"
              : "rgba(255, 255, 255, 0.12)",
        },
        ticks: {
          color: variant === "v1" ? "#626d80" : "#a1a1aa",
          maxTicksLimit: 7,
          callback: (value) =>
            shortDateFormatter.format(new Date(Number(value))),
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: variant === "v1" ? "#39445a" : "#d4d4d8" },
      },
    },
  };
}
