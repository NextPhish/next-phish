import type { WorkerConfig } from "./config";
import { commonJobOptions, type WorkerQueues } from "./queues";

export async function registerSchedulers(
  queues: WorkerQueues,
  config: WorkerConfig,
) {
  await queues.schedule.upsertJobScheduler(
    "schedule-poller",
    { every: config.schedule.intervalMs },
    {
      name: "poll",
      data: { version: 1 },
      opts: commonJobOptions,
    },
  );
  await queues.outbox.upsertJobScheduler(
    "outbox-publisher",
    { every: config.outbox.intervalMs },
    {
      name: "publish",
      data: { version: 1 },
      opts: commonJobOptions,
    },
  );
  await queues.outbox.upsertJobScheduler(
    "execution-maintenance",
    { every: config.maintenanceIntervalMs },
    {
      name: "maintenance",
      data: { version: 1 },
      opts: commonJobOptions,
    },
  );
  await queues.feeder.upsertJobScheduler(
    "delivery-feeder",
    { every: config.feeder.intervalMs },
    {
      name: "feed-deliveries",
      data: { version: 1, wakeId: "periodic" },
      opts: commonJobOptions,
    },
  );
}
