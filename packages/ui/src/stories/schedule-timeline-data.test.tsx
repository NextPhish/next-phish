import { describe, expect, it } from "vitest";
import { buildTimelineRows } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-timeline/parts/schedule-timeline-data";

describe("schedule timeline data", () => {
  it("clamps ranges, applies fallback durations, and sorts by start", () => {
    const range = {
      startsAt: new Date("2026-09-01T00:00:00.000Z"),
      endsAt: new Date("2026-12-01T00:00:00.000Z"),
    };
    const data = {
      schedules: [
        {
          id: "schedule",
          name: "Quarterly simulation",
          status: "RUNNING",
          type: "RECURRING",
          startsAt: new Date("2026-08-20T00:00:00.000Z"),
          endsAt: new Date("2026-12-20T00:00:00.000Z"),
          autoCompleteAfterDays: null,
        },
      ],
      campaigns: [
        {
          id: "campaign",
          name: "October campaign",
          status: "SCHEDULED",
          occurrenceAt: new Date("2026-10-01T00:00:00.000Z"),
          createdAt: new Date("2026-09-25T00:00:00.000Z"),
          autoCompleteAfterDays: null,
        },
      ],
    } as Parameters<typeof buildTimelineRows>[0];

    expect(buildTimelineRows(data, range)).toEqual([
      expect.objectContaining({
        id: "schedule",
        kind: "schedule",
        start: range.startsAt,
        end: range.endsAt,
      }),
      expect.objectContaining({
        id: "campaign",
        kind: "campaign",
        start: new Date("2026-10-01T00:00:00.000Z"),
        end: new Date("2026-10-21T00:00:00.000Z"),
      }),
    ]);
  });
});
