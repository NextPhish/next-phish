import { stableJobId, type OutboxRepository } from "@next-phish/backend";
import type { Logger } from "pino";
import { commonJobOptions, type WorkerQueues } from "../queues";

const outboxRoutes = {
  materialization: {
    queue: "materialization",
    jobName: "materialize-occurrence",
  },
  "delivery-feeder": { queue: "feeder", jobName: "feed-deliveries" },
  delivery: { queue: "delivery", jobName: "deliver-recipient" },
  "delivery-events": { queue: "events", jobName: "process-delivery-event" },
  "tracking-events": { queue: "tracking", jobName: "process-tracking-event" },
} as const satisfies Record<
  string,
  { queue: keyof WorkerQueues; jobName: string }
>;

export function resolveOutboxRoute(topic: string) {
  if (!Object.hasOwn(outboxRoutes, topic)) {
    throw new Error(`Unknown outbox topic: ${topic}`);
  }
  return outboxRoutes[topic as keyof typeof outboxRoutes];
}

type OutboxPublisherDependencies = {
  repository: Pick<OutboxRepository, "claimBatch" | "acknowledge" | "fail">;
  queues: { [K in keyof WorkerQueues]: Pick<WorkerQueues[K], "add"> };
  workerId: string;
  batchSize: number;
  logger: Logger;
};

export function createOutboxPublisher({
  repository,
  queues,
  workerId,
  batchSize,
  logger,
}: OutboxPublisherDependencies) {
  const log = logger.child({ queue: "outbox", workerId });
  return async () => {
    const rows = await repository.claimBatch(workerId, batchSize);
    for (const row of rows) {
      try {
        const { queue, jobName } = resolveOutboxRoute(row.topic);
        await queues[queue].add(jobName, row.payload, {
          ...commonJobOptions,
          jobId: stableJobId(row.deduplicationKey),
        });
        await repository.acknowledge(row.id, workerId);
        log.debug(
          { outboxId: row.id, topic: row.topic },
          "Outbox event published",
        );
      } catch (err) {
        log.error(
          { err, outboxId: row.id, topic: row.topic },
          "Outbox publication failed",
        );
        await repository.fail(
          row.id,
          workerId,
          err instanceof Error ? err.message : "Outbox publish failed",
        );
      }
    }
  };
}
