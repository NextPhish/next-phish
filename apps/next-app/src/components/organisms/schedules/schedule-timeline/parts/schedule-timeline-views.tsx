"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

function TimelineChart({
  rows,
  range,
  variant,
  mediumDateFormatter,
  shortDateFormatter,
  statusLabel,
  onRowNavigate,
  labels,
}: Pick<
  TimelineViewProps,
  | "rows"
  | "range"
  | "mediumDateFormatter"
  | "shortDateFormatter"
  | "statusLabel"
  | "onRowNavigate"
> & {
  variant: "legacy" | "v1";
  labels?: { schedules: string; campaigns: string };
}) {
  const data = rows.map((row) => ({
    ...row,
    range: [row.start.getTime(), row.end.getTime()] as [number, number],
  }));
  const axis = variant === "v1" ? "#626d80" : "#a1a1aa";
  const grid =
    variant === "v1" ? "rgba(25,34,53,.08)" : "rgba(255,255,255,.08)";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        accessibilityLayer={variant !== "v1"}
      >
        <CartesianGrid stroke={grid} horizontal={false} />
        <XAxis
          type="number"
          domain={[range.startsAt.getTime(), range.endsAt.getTime()]}
          tickFormatter={(value) => shortDateFormatter.format(new Date(value))}
          tick={{ fill: axis, fontSize: 11 }}
          axisLine={{ stroke: grid }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={130}
          tick={{ fill: axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(_value, _name, item) => {
            const row = item.payload as TimelineRow;
            const kind =
              row.kind === "schedule"
                ? (labels?.schedules ?? "Schedule")
                : (labels?.campaigns ?? "Campaign");
            return [
              `${kind} · ${statusLabel(row.status)} · ${mediumDateFormatter.format(row.start)} – ${mediumDateFormatter.format(row.end)}`,
              row.label,
            ];
          }}
        />
        <Bar
          dataKey="range"
          barSize={18}
          radius={6}
          isAnimationActive={false}
          onClick={(_entry, index) => {
            const row = rows[index];
            if (row) onRowNavigate(row);
          }}
          className="cursor-pointer"
        >
          {rows.map((row) => (
            <Cell
              key={`${row.kind}-${row.id}`}
              fill={
                row.kind === "schedule"
                  ? variant === "v1"
                    ? "#6d60dc"
                    : "#29b8ff"
                  : variant === "v1"
                    ? "#4ab3a5"
                    : "#15e5d4"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

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
          <TimelineChart
            rows={rows}
            range={range}
            variant="legacy"
            mediumDateFormatter={mediumDateFormatter}
            shortDateFormatter={shortDateFormatter}
            statusLabel={statusLabel}
            onRowNavigate={onRowNavigate}
          />
        </div>
      ) : (
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-zinc-400">
          No schedules or running campaigns in the next three months.
        </div>
      )}
    </section>
  );
}
