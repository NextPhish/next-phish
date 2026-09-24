import { Worker, type Job, type WorkerOptions } from "bullmq";
import type { Logger } from "pino";
import type { WorkerQueueName } from "../config";

export type JobHandlers = Record<string, (job: Job) => Promise<unknown>>;

export function strictHandler(handlers: JobHandlers) {
  return async (job: Job) => {
    if (!Object.hasOwn(handlers, job.name)) {
      throw new Error(`Unknown job type: ${job.name}`);
    }
    return handlers[job.name](job);
  };
}

export function createWorker(
  name: WorkerQueueName,
  handlers: JobHandlers,
  options: WorkerOptions,
  logger: Logger,
) {
  const log = logger.child({ queue: name });
  const worker = new Worker(name, strictHandler(handlers), options);
  worker.on("error", (err) => log.error({ err }, "Worker error"));
  worker.on("failed", (job, err) =>
    log.error(
      {
        err,
        jobId: job?.id,
        jobName: job?.name,
        attemptsMade: job?.attemptsMade,
      },
      "Job failed",
    ),
  );
  worker.on("stalled", (jobId) => log.warn({ jobId }, "Job stalled"));
  worker.on("active", (job) =>
    log.debug({ jobId: job.id, jobName: job.name }, "Job started"),
  );
  worker.on("completed", (job) =>
    log.debug({ jobId: job.id, jobName: job.name }, "Job completed"),
  );
  worker.on("ready", () =>
    log.info({ concurrency: options.concurrency }, "Worker ready"),
  );
  return worker;
}
