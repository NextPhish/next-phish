import { assertNeutralDomain, getPublicContentUrl } from "@next-phish/backend";
import { db } from "@next-phish/database";
import type { Worker } from "bullmq";
import type { Logger } from "pino";
import { loadWorkerConfig } from "./config";
import { createConnection } from "./connection";
import { initializeWorkerContainer } from "./container";
import { createQueues } from "./queues";
import { registerSchedulers } from "./schedulers";
import { registerWorkers } from "./workers/register-workers";

export async function startWorkerApplication(logger: Logger) {
  const config = loadWorkerConfig();
  logger.level = config.logLevel;
  assertNeutralDomain(process.env.MESSAGE_ID_DOMAIN ?? "mail.example.com");
  getPublicContentUrl();
  const encryptionKey = process.env.PAGE_SUBMISSION_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error(
      "PAGE_SUBMISSION_ENCRYPTION_KEY environment variable is not set.",
    );
  }

  const connection = createConnection(config.redis, logger);
  const queues = createQueues(connection);
  for (const queue of Object.values(queues)) {
    queue.on("error", (err) =>
      logger.error({ err, queue: queue.name }, "Queue error"),
    );
  }
  let workers: Worker[] = [];
  let closing: Promise<void> | undefined;

  async function close() {
    // Drain processors before closing the queues they publish to.
    const workerResults = await Promise.allSettled(
      workers.map((worker) => worker.close()),
    );
    const queueResults = await Promise.allSettled(
      Object.values(queues).map((queue) => queue.close()),
    );
    const connectionResults = await Promise.allSettled([
      connection.quit(),
      db.$disconnect(),
    ]);
    connection.disconnect();
    const failures = [
      ...workerResults,
      ...queueResults,
      ...connectionResults,
    ].filter((result) => result.status === "rejected");
    if (failures.length) {
      throw new AggregateError(
        failures.map((result) => result.reason),
        "Worker shutdown failed",
      );
    }
    logger.info("Execution workers stopped");
  }

  function shutdown(reason: string) {
    if (!closing) {
      logger.info({ reason }, "Closing execution workers");
      closing = close();
    }
    return closing;
  }

  try {
    initializeWorkerContainer(connection, encryptionKey);
    await registerSchedulers(queues, config);
    workers = registerWorkers(connection, queues, config, logger);
    await Promise.all(workers.map((worker) => worker.waitUntilReady()));
    logger.info("Execution workers started");
    return { shutdown };
  } catch (err) {
    await shutdown("startup failure").catch((closeError) =>
      logger.error({ err: closeError }, "Startup cleanup failed"),
    );
    throw err;
  }
}
