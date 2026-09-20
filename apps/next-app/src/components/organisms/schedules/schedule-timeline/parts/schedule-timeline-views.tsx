"use client";

import { lazy, Suspense } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import {
  Badge as UiBadge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Skeleton,
} from "@next-phish/ui";
import type { TimelineRange, TimelineRow } from "./schedule-timeline-data";
import type { ScheduleTimelineProps } from "../types/schedule-timeline.types";

interface TimelineViewProps {
  rows: TimelineRow[];
  range: TimelineRange;
  isLoading: boolean;
  mediumDateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  statusLabel: (status: string) => string;
  onRowNavigate: (row: TimelineRow) => void;
}
const TimelineChart = lazy(() => import("./timeline-chart"));

export function ScheduleTimelineV1View({
  rows,
  range,
  isLoading,
  mediumDateFormatter,
  shortDateFormatter,
  statusLabel,
  onRowNavigate,
  labels,
  error,
}: TimelineViewProps & {
  labels: NonNullable<ScheduleTimelineProps["labels"]>;
  error: boolean;
}) {
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
          <Skeleton className="h-72 rounded-lg" />
        ) : error ? (
          <EmptyState icon={<CalendarClock size={24} />} title={labels.error} />
        ) : rows.length ? (
          <>
            <div
              aria-hidden="true"
              style={{ height: `${Math.max(280, rows.length * 42 + 64)}px` }}
            >
              <Suspense fallback={<Skeleton className="h-full rounded-lg" />}>
                <TimelineChart
                  rows={rows}
                  range={range}
                  variant="v1"
                  mediumDateFormatter={mediumDateFormatter}
                  shortDateFormatter={shortDateFormatter}
                  statusLabel={statusLabel}
                  onRowNavigate={onRowNavigate}
                  labels={labels}
                />
              </Suspense>
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
          <EmptyState icon={<CalendarClock size={24} />} title={labels.empty} />
        )}
      </CardBody>
    </Card>
  );
}

export function ScheduleTimelineLegacyView({
  rows,
  range,
  isLoading,
  mediumDateFormatter,
  shortDateFormatter,
  statusLabel,
  onRowNavigate,
}: TimelineViewProps) {
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
        <Skeleton className="h-72 rounded-xl" />
      ) : rows.length ? (
        <div style={{ height: `${Math.max(280, rows.length * 42 + 64)}px` }}>
          <Suspense fallback={<Skeleton className="h-full rounded-xl" />}>
            <TimelineChart
              rows={rows}
              range={range}
              variant="legacy"
              mediumDateFormatter={mediumDateFormatter}
              shortDateFormatter={shortDateFormatter}
              statusLabel={statusLabel}
              onRowNavigate={onRowNavigate}
            />
          </Suspense>
        </div>
      ) : (
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-zinc-400">
          No schedules or running campaigns in the next three months.
        </div>
      )}
    </section>
  );
}
