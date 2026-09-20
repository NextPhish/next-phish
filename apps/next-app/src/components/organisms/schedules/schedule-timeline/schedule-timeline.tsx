"use client";

import { useScheduleTimeline } from "./hooks/use-schedule-timeline";
import {
  ScheduleTimelineV1View,
  ScheduleTimelineLegacyView,
} from "./parts/schedule-timeline-views";
import type { ScheduleTimelineProps } from "./types/schedule-timeline.types";
export type { TimelineRow } from "./parts/schedule-timeline-data";
export type { ScheduleTimelineProps } from "./types/schedule-timeline.types";

export function ScheduleTimeline(props: ScheduleTimelineProps = {}) {
  const model = useScheduleTimeline(props);
  if (model.variant === "v1" && model.labels)
    return <ScheduleTimelineV1View {...model} labels={model.labels} />;
  return <ScheduleTimelineLegacyView {...model} />;
}
