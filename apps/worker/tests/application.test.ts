import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/logger";

const mocks = vi.hoisted(() => {
  const order: string[] = [];
  const connection = {
    quit: vi.fn(async () => {
      order.push("redis");
    }),
    disconnect: vi.fn(),
  };
  const queue = {
    name: "outbox",
    on: vi.fn(),
    close: vi.fn(async () => {
      order.push("queue");
    }),
  };
  const worker = {
    waitUntilReady: vi.fn(async () => {}),
    close: vi.fn(async () => {
      order.push("worker");
    }),
  };
  return {
    order,
    connection,
    queue,
    worker,
    createConnection: vi.fn(() => connection),
    initializeContainer: vi.fn(),
    registerSchedulers: vi.fn(async () => {}),
    registerWorkers: vi.fn(() => [worker]),
    disconnectDb: vi.fn(async () => {
      order.push("database");
    }),
  };
});
vi.mock("@next-phish/backend", () => ({
  assertNeutralDomain: vi.fn(),
  getPublicContentUrl: vi.fn(),
}));
vi.mock("@next-phish/database", () => ({
  db: { $disconnect: mocks.disconnectDb },
}));
vi.mock("../src/connection", () => ({
  createConnection: mocks.createConnection,
}));
vi.mock("../src/container", () => ({
  initializeWorkerContainer: mocks.initializeContainer,
}));
vi.mock("../src/queues", () => ({
  createQueues: () => ({ outbox: mocks.queue }),
}));
vi.mock("../src/schedulers", () => ({
  registerSchedulers: mocks.registerSchedulers,
}));
vi.mock("../src/workers/register-workers", () => ({
  registerWorkers: mocks.registerWorkers,
}));
import { startWorkerApplication } from "../src/application";

const logger = createLogger({ level: "silent" });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.order.length = 0;
  vi.stubEnv("PAGE_SUBMISSION_ENCRYPTION_KEY", "test-key");
  vi.stubEnv("LOG_LEVEL", "silent");
});
afterEach(() => vi.unstubAllEnvs());

describe("worker application lifecycle", () => {
  it("rejects invalid configuration before opening Redis", async () => {
    vi.stubEnv("DELIVERY_CONCURRENCY", "0");
    await expect(startWorkerApplication(logger)).rejects.toThrow(
      "DELIVERY_CONCURRENCY",
    );
    expect(mocks.createConnection).not.toHaveBeenCalled();
  });

  it("drains workers before queues and connections, and closes only once", async () => {
    const app = await startWorkerApplication(logger);
    await Promise.all([app.shutdown("SIGTERM"), app.shutdown("SIGINT")]);
    expect(mocks.order).toEqual(["worker", "queue", "redis", "database"]);
    expect(mocks.worker.close).toHaveBeenCalledTimes(1);
    expect(mocks.connection.disconnect).toHaveBeenCalledTimes(1);
  });

  it("cleans up queues and connections when scheduler setup fails", async () => {
    mocks.registerSchedulers.mockRejectedValueOnce(
      new Error("Scheduler failed"),
    );
    await expect(startWorkerApplication(logger)).rejects.toThrow(
      "Scheduler failed",
    );
    expect(mocks.registerWorkers).not.toHaveBeenCalled();
    expect(mocks.order).toEqual(["queue", "redis", "database"]);
  });

  it("cleans up workers when readiness fails", async () => {
    mocks.worker.waitUntilReady.mockRejectedValueOnce(
      new Error("Readiness failed"),
    );
    await expect(startWorkerApplication(logger)).rejects.toThrow(
      "Readiness failed",
    );
    expect(mocks.order).toEqual(["worker", "queue", "redis", "database"]);
  });

  it("attempts all resource cleanup even when a worker fails to close", async () => {
    const app = await startWorkerApplication(logger);
    mocks.worker.close.mockRejectedValueOnce(new Error("Worker close failed"));
    await expect(app.shutdown("SIGTERM")).rejects.toThrow(
      "Worker shutdown failed",
    );
    expect(mocks.order).toEqual(["queue", "redis", "database"]);
    expect(mocks.connection.disconnect).toHaveBeenCalled();
  });
});
