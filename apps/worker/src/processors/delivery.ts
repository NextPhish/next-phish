import type { Job } from "bullmq";
import {
  Container,
  DeliveryRepository,
  DeliveryProcessorService,
} from "@next-phish/backend";
import {
  deliverRecipientPayloadSchema,
  feedDeliveriesPayloadSchema,
} from "@next-phish/shared";
import type { WorkerConfig } from "../config";

export function createDeliveryFeeder(config: WorkerConfig["feeder"]) {
  return async (job: Job) => {
    feedDeliveriesPayloadSchema.parse(job.data);
    return Container.get(DeliveryRepository).feedNearTerm(
      new Date(Date.now() + config.horizonMinutes * 60_000),
      config.batch,
    );
  };
}

export function deliverRecipient(job: Job) {
  const payload = deliverRecipientPayloadSchema.parse(job.data);
  return Container.get(DeliveryProcessorService).process(
    payload.campaignRecipientId,
  );
}

export async function processDeliveryEvent(): Promise<never> {
  throw new Error("Delivery event integration is not configured");
}

export function cleanupExecutionHistory() {
  return Container.get(DeliveryRepository).cleanupExecutionHistory();
}
