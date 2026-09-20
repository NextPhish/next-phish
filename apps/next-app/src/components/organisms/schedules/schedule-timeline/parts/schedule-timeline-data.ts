import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/router";

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
