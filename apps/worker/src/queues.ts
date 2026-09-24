import { Queue, type JobsOptions } from "bullmq";
import type { Redis } from "ioredis";

export const commonJobOptions: JobsOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: { count: 5_000, age: 86_400 },
  removeOnFail: { count: 10_000, age: 7 * 86_400 },
};

export function createQueues(connection: Redis) {
  const options = { connection };
  return {
    schedule: new Queue("schedule-execution", options),
    materialization: new Queue("materialization", options),
    feeder: new Queue("delivery-feeder", options),
    delivery: new Queue("delivery", options),
    events: new Queue("delivery-events", options),
    tracking: new Queue("tracking-events", options),
    outbox: new Queue("outbox", options),
  };
}

export type WorkerQueues = ReturnType<typeof createQueues>;
