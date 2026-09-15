"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chart } from "primereact/chart";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { Skeleton } from "primereact/skeleton";
import { CalendarClock } from "lucide-react";
import {
  Badge as UiBadge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Skeleton as UiSkeleton,
} from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";

const DAY_MS = 86_400_000;

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function endFromDays(start: Date, days: number | null): Date {
  return new Date(start.getTime() + (days ?? 20) * DAY_MS);
}

type TimelineRow = {
  id: string;
  kind: "schedule" | "campaign";
  label: string;
  status: string;
  start: Date;
  end: Date;
};

interface ScheduleTimelineProps {
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
  const range = useMemo(() => {
    const startsAt = new Date();
    startsAt.setHours(0, 0, 0, 0);
    return { startsAt, endsAt: addMonths(startsAt, 3) };
  }, []);
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

  const rows = useMemo<TimelineRow[]>(() => {
    if (!data) return [];
    const schedules = data.schedules.map((schedule) => {
      const start = new Date(
        Math.max(
          new Date(schedule.startsAt).getTime(),
          range.startsAt.getTime(),
        ),
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
        start: new Date(
          Math.max(occurrence.getTime(), range.startsAt.getTime()),
        ),
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
  }, [data, range]);

  const chartData = useMemo<ChartData<"bar", [number, number][], string>>(
    () => ({
      labels: rows.map((row) => row.label),
      datasets: [
        {
          label: "Timeline",
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
    }),
    [rows, variant],
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      indexAxis: "y",
      maintainAspectRatio: false,
      animation: false,
      onClick: (_event, elements) => {
        const row = rows[elements[0]?.index ?? -1];
        if (row)
          router.push(
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
              return `${kindLabel} · ${row.status} · ${mediumDateFormatter.format(row.start)} – ${mediumDateFormatter.format(row.end)}`;
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
    }),
    [
      labels,
      mediumDateFormatter,
      range,
      router,
      rows,
      shortDateFormatter,
      variant,
    ],
  );

  if (variant === "v1" && labels) {
    return (
      <Card aria-label={labels.title}>
        <CardHeader
          title={labels.title}
          description={labels.description}
          action={<UiBadge>{labels.range}</UiBadge>}
        />
        <CardBody className="pt-0">
          <div
            className="mb-4 flex gap-4 text-xs text-ui-muted"
            aria-label={`${labels.schedules}, ${labels.campaigns}`}
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-ui-primary" />
              {labels.schedules}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#4ab3a5]" />
              {labels.campaigns}
            </span>
          </div>
          {isLoading ? (
            <UiSkeleton className="h-72 rounded-lg" />
          ) : error ? (
            <EmptyState
              icon={<CalendarClock size={24} />}
              title={labels.error}
            />
          ) : rows.length ? (
            <>
              <div
                aria-hidden="true"
                style={{ height: `${Math.max(280, rows.length * 42 + 64)}px` }}
              >
                <Chart type="bar" data={chartData} options={options} />
              </div>
              <ul className="mt-5 grid gap-2 border-t border-ui-border pt-4 sm:grid-cols-2">
                {rows.map((row) => (
                  <li key={`${row.kind}-${row.id}`}>
                    <Link
                      href={
                        row.kind === "schedule"
                          ? `/schedule/${row.id}`
                          : `/campaigns/${row.id}`
                      }
                      className="block rounded-lg border border-ui-border px-3 py-2 transition-colors hover:border-[#cbc6ef] hover:bg-ui-tint"
                    >
                      <span className="block truncate text-sm font-semibold">
                        {row.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-ui-muted">
                        {row.kind === "schedule"
                          ? labels.schedules
                          : labels.campaigns}
                        {" · "}
                        {mediumDateFormatter.format(row.start)} –{" "}
                        {mediumDateFormatter.format(row.end)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              icon={<CalendarClock size={24} />}
              title={labels.empty}
            />
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <section
      aria-labelledby="schedule-timeline-heading"
      className="rounded-xl border border-white/10 bg-brand-dark p-5"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="schedule-timeline-heading"
            className="text-lg font-semibold text-white"
          >
            Three-month timeline
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Upcoming schedules and running campaigns. Select a bar to open it.
          </p>
        </div>
        <div
          className="flex gap-4 text-xs text-zinc-300"
          aria-label="Timeline legend"
        >
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-blue" />
            Schedules
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-cyan" />
            Campaigns
          </span>
        </div>
      </div>
      {isLoading ? (
        <Skeleton height="18rem" borderRadius="0.75rem" />
      ) : rows.length ? (
        <div style={{ height: `${Math.max(280, rows.length * 42 + 64)}px` }}>
          <Chart type="bar" data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-zinc-400">
          No schedules or running campaigns in the next three months.
        </div>
      )}
    </section>
  );
}
