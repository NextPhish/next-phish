import { Redis } from "ioredis";
import type { Logger } from "pino";
import type { WorkerConfig } from "./config";

export function createConnection(
  config: WorkerConfig["redis"],
  logger: Logger,
) {
  const connection = new Redis({ ...config, maxRetriesPerRequest: null });
  connection.on("error", (err) =>
    logger.error({ err }, "Redis connection error"),
  );
  return connection;
}
