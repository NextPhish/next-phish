import { initializeContainer } from "@next-phish/backend";
import type { Redis } from "ioredis";

export function initializeWorkerContainer(
  connection: Redis,
  encryptionKey: string,
) {
  initializeContainer({ encryptionKey, redis: connection });
}
