import type { Job } from "bullmq";
import {
  Container,
  DeliveryRepository,
  ScheduleExecutionRepository,
  MaterializeClaimedOccurrenceCommand,
} from "@next-phish/backend";
import { materializeOccurrencePayloadSchema } from "@next-phish/shared";
import type { WorkerConfig } from "../config";

export function createSchedulePoller(config: WorkerConfig["schedule"]) {
  return async () => {
    const occurrences = await Container.get(
      ScheduleExecutionRepository,
    ).claimDueSchedules(config.batch);
    await Container.get(DeliveryRepository).recoverExpiredLeases();
    return occurrences;
  };
}

export function materializeOccurrence(job: Job) {
  return Container.get(MaterializeClaimedOccurrenceCommand).execute(
    materializeOccurrencePayloadSchema.parse(job.data),
  );
}
