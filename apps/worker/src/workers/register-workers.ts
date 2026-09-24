import { randomUUID } from "node:crypto";
import { Container, OutboxRepository } from "@next-phish/backend";
import type { Redis } from "ioredis";
import type { Logger } from "pino";
import type { WorkerConfig, WorkerQueueName } from "../config";
import type { WorkerQueues } from "../queues";
import { welcomeUser } from "../processors/notifications";
import { importSite, importTargetGroup } from "../processors/imports";
import {
  createSchedulePoller,
  materializeOccurrence,
} from "../processors/scheduling";
import {
  createDeliveryFeeder,
  deliverRecipient,
  processDeliveryEvent,
  cleanupExecutionHistory,
} from "../processors/delivery";
import { processTrackingEvent } from "../processors/tracking";
import { createOutboxPublisher } from "../processors/outbox";
import { createWorker, type JobHandlers } from "./create-worker";

export function registerWorkers(
  connection: Redis,
  queues: WorkerQueues,
  config: WorkerConfig,
  logger: Logger,
) {
  const handlers: Record<WorkerQueueName, JobHandlers> = {
    "user-notifications": { "welcome-user": welcomeUser },
    jobs: { site_import: importSite },
    imports: { target_group_import: importTargetGroup },
    "schedule-execution": { poll: createSchedulePoller(config.schedule) },
    materialization: { "materialize-occurrence": materializeOccurrence },
    "delivery-feeder": {
      "feed-deliveries": createDeliveryFeeder(config.feeder),
    },
    delivery: { "deliver-recipient": deliverRecipient },
    "delivery-events": { "process-delivery-event": processDeliveryEvent },
    "tracking-events": { "process-tracking-event": processTrackingEvent },
    outbox: {
      maintenance: cleanupExecutionHistory,
      publish: createOutboxPublisher({
        repository: Container.get(OutboxRepository),
        queues,
        workerId: `outbox:${process.pid}:${randomUUID()}`,
        batchSize: config.outbox.batch,
        logger,
      }),
    },
  };

  return (Object.keys(handlers) as WorkerQueueName[]).map((name) =>
    createWorker(
      name,
      handlers[name],
      {
        connection,
        concurrency: config.concurrency[name],
        ...(name === "delivery" ? { limiter: config.deliveryLimiter } : {}),
      },
      logger,
    ),
  );
}
