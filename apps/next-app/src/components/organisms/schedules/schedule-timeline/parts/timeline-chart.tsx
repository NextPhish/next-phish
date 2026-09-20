"use client";

import { lazy } from "react";
import type { TimelineRange, TimelineRow } from "./schedule-timeline-data";

interface Props {
  rows: TimelineRow[];
  range: TimelineRange;
  variant: "legacy" | "v1";
  mediumDateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  statusLabel: (status: string) => string;
  onRowNavigate: (row: TimelineRow) => void;
  labels?: { schedules: string; campaigns: string };
}

const TimelineChart = lazy(() =>
  import("recharts").then(
    ({
      Bar,
      BarChart,
      CartesianGrid,
      Cell,
      ResponsiveContainer,
      Tooltip,
      XAxis,
      YAxis,
    }) => ({
      default: function TimelineVisualization({
        rows,
        range,
        variant,
        mediumDateFormatter,
        shortDateFormatter,
        statusLabel,
        onRowNavigate,
        labels,
      }: Props) {
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
                tickFormatter={(value) =>
                  shortDateFormatter.format(new Date(value))
                }
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
      },
    }),
  ),
);

export default TimelineChart;
