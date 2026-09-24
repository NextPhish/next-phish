import type { Job } from "bullmq";
import { Container, TrackingService } from "@next-phish/backend";
import { processTrackingEventPayloadSchema } from "@next-phish/shared";

export function processTrackingEvent(job: Job) {
  const payload = processTrackingEventPayloadSchema.parse(job.data);
  return Container.get(TrackingService).processQueuedRecord(
    payload.trackingEventId,
  );
}
