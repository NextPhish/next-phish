import { startWorkerApplication } from "./application";
import { createLogger } from "./logger";

const logger = createLogger();

void startWorkerApplication(logger)
  .then(({ shutdown }) => {
    for (const signal of ["SIGTERM", "SIGINT"] as const) {
      process.on(signal, () => {
        void shutdown(signal).catch((err) => {
          logger.error({ err }, "Worker shutdown failed");
          process.exitCode = 1;
        });
      });
    }
  })
  .catch((err) => {
    logger.fatal({ err }, "Worker bootstrap failed");
    process.exitCode = 1;
  });
