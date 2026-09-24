import { z } from "zod";

const positiveInteger = (fallback: number) =>
  z.coerce.number().int().positive().safe().default(fallback);

const workerEnvironmentSchema = z.object({
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: positiveInteger(6379).pipe(z.number().max(65535)),
  USER_NOTIFICATIONS_CONCURRENCY: positiveInteger(5),
  JOBS_CONCURRENCY: positiveInteger(5),
  IMPORTS_CONCURRENCY: positiveInteger(3),
  SCHEDULE_EXECUTION_CONCURRENCY: positiveInteger(1),
  MATERIALIZATION_CONCURRENCY: positiveInteger(2),
  DELIVERY_FEEDER_CONCURRENCY: positiveInteger(1),
  DELIVERY_CONCURRENCY: positiveInteger(10),
  DELIVERY_EVENTS_CONCURRENCY: positiveInteger(5),
  TRACKING_EVENTS_CONCURRENCY: positiveInteger(10),
  OUTBOX_CONCURRENCY: positiveInteger(1),
  SCHEDULE_CLAIM_BATCH: positiveInteger(50),
  SCHEDULE_POLL_INTERVAL_MS: positiveInteger(10_000),
  OUTBOX_POLL_INTERVAL_MS: positiveInteger(5_000),
  OUTBOX_CLAIM_BATCH: positiveInteger(100).pipe(z.number().max(500)),
  DELIVERY_FEED_INTERVAL_MS: positiveInteger(10_000),
  DELIVERY_HORIZON_MINUTES: positiveInteger(5),
  DELIVERY_FEED_BATCH: positiveInteger(500),
  DELIVERY_RATE_MAX: positiveInteger(60),
  DELIVERY_RATE_DURATION_MS: positiveInteger(60_000),
  EXECUTION_MAINTENANCE_INTERVAL_MS: positiveInteger(86_400_000),
});

export function loadWorkerConfig(env: NodeJS.ProcessEnv = process.env) {
  const values = workerEnvironmentSchema.parse(env);
  return {
    logLevel: values.LOG_LEVEL,
    redis: { host: values.REDIS_HOST, port: values.REDIS_PORT },
    concurrency: {
      "user-notifications": values.USER_NOTIFICATIONS_CONCURRENCY,
      jobs: values.JOBS_CONCURRENCY,
      imports: values.IMPORTS_CONCURRENCY,
      "schedule-execution": values.SCHEDULE_EXECUTION_CONCURRENCY,
      materialization: values.MATERIALIZATION_CONCURRENCY,
      "delivery-feeder": values.DELIVERY_FEEDER_CONCURRENCY,
      delivery: values.DELIVERY_CONCURRENCY,
      "delivery-events": values.DELIVERY_EVENTS_CONCURRENCY,
      "tracking-events": values.TRACKING_EVENTS_CONCURRENCY,
      outbox: values.OUTBOX_CONCURRENCY,
    },
    schedule: {
      batch: values.SCHEDULE_CLAIM_BATCH,
      intervalMs: values.SCHEDULE_POLL_INTERVAL_MS,
    },
    outbox: {
      batch: values.OUTBOX_CLAIM_BATCH,
      intervalMs: values.OUTBOX_POLL_INTERVAL_MS,
    },
    feeder: {
      batch: values.DELIVERY_FEED_BATCH,
      horizonMinutes: values.DELIVERY_HORIZON_MINUTES,
      intervalMs: values.DELIVERY_FEED_INTERVAL_MS,
    },
    deliveryLimiter: {
      max: values.DELIVERY_RATE_MAX,
      duration: values.DELIVERY_RATE_DURATION_MS,
    },
    maintenanceIntervalMs: values.EXECUTION_MAINTENANCE_INTERVAL_MS,
  };
}

export type WorkerConfig = ReturnType<typeof loadWorkerConfig>;
export type WorkerQueueName = keyof WorkerConfig["concurrency"];
