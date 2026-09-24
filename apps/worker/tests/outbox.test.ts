import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/logger";
import { commonJobOptions } from "../src/queues";

// Import only the pure identity helper; avoid booting backend services in unit tests.
vi.mock(
  "@next-phish/backend",
  async () =>
    import("../../../packages/backend/src/delivery/services/execution-identity.service"),
);
import {
  createOutboxPublisher,
  resolveOutboxRoute,
} from "../src/processors/outbox";

const routes = [
  ["materialization", "materialization", "materialize-occurrence"],
  ["delivery-feeder", "feeder", "feed-deliveries"],
  ["delivery", "delivery", "deliver-recipient"],
  ["delivery-events", "events", "process-delivery-event"],
  ["tracking-events", "tracking", "process-tracking-event"],
] as const;

function fixture(topics: string[]) {
  const rows = topics.map((topic, index) => ({
    id: String(index),
    topic,
    payloadVersion: 1,
    payload: { version: 1 },
    deduplicationKey: `event:${index}`,
  }));
  const calls: string[] = [];
  const repository = {
    claimBatch: vi.fn().mockResolvedValue(rows),
    acknowledge: vi.fn().mockImplementation(async (id) => {
      calls.push(`ack:${id}`);
    }),
    fail: vi.fn().mockResolvedValue({ count: 1 }),
  };
  const queue = () => ({
    add: vi.fn().mockImplementation(async () => {
      calls.push("add");
    }),
  });
  const queues = {
    schedule: queue(),
    materialization: queue(),
    feeder: queue(),
    delivery: queue(),
    events: queue(),
    tracking: queue(),
    outbox: queue(),
  };
  const logs: string[] = [];
  const logger = createLogger(
    {},
    {
      write: (line) => {
        logs.push(line);
      },
    },
  );
  const publish = createOutboxPublisher({
    repository,
    queues,
    workerId: "publisher",
    batchSize: 23,
    logger,
  });
  return { publish, repository, queues, rows, calls, logs };
}

describe("outbox publisher", () => {
  it.each(routes)(
    "routes %s and acknowledges only after enqueueing",
    async (topic, queue, jobName) => {
      const f = fixture([topic]);
      await f.publish();
      expect(f.repository.claimBatch).toHaveBeenCalledWith("publisher", 23);
      expect(f.queues[queue].add).toHaveBeenCalledWith(
        jobName,
        f.rows[0].payload,
        {
          ...commonJobOptions,
          jobId: createHash("sha256").update("event:0").digest("hex"),
        },
      );
      expect(f.repository.acknowledge).toHaveBeenCalledWith("0", "publisher");
      expect(f.calls).toEqual(["add", "ack:0"]);
      expect(f.repository.fail).not.toHaveBeenCalled();
    },
  );

  it.each(["unknown", "constructor", "toString", "__proto__"])(
    "rejects unknown topic %s",
    (topic) => {
      expect(() => resolveOutboxRoute(topic)).toThrow(
        `Unknown outbox topic: ${topic}`,
      );
    },
  );

  it("records unknown-topic failures and continues the batch", async () => {
    const f = fixture(["unknown", "delivery"]);
    await f.publish();
    expect(f.repository.fail).toHaveBeenCalledWith(
      "0",
      "publisher",
      "Unknown outbox topic: unknown",
    );
    expect(f.repository.acknowledge).toHaveBeenCalledExactlyOnceWith(
      "1",
      "publisher",
    );
    expect(JSON.parse(f.logs[0])).toMatchObject({
      level: 50,
      outboxId: "0",
      topic: "unknown",
      err: { message: "Unknown outbox topic: unknown" },
    });
  });

  it("does not acknowledge a failed enqueue and still publishes subsequent rows", async () => {
    const f = fixture(["delivery", "tracking-events"]);
    f.queues.delivery.add.mockRejectedValueOnce(new Error("Redis unavailable"));
    await f.publish();
    expect(f.repository.fail).toHaveBeenCalledWith(
      "0",
      "publisher",
      "Redis unavailable",
    );
    expect(f.repository.acknowledge).toHaveBeenCalledExactlyOnceWith(
      "1",
      "publisher",
    );
  });

  it("reuses the stable job ID when acknowledgement fails and a row is retried", async () => {
    const f = fixture(["delivery"]);
    f.repository.acknowledge.mockRejectedValueOnce(
      new Error("Database unavailable"),
    );
    await f.publish();
    await f.publish();
    expect(f.repository.fail).toHaveBeenCalledWith(
      "0",
      "publisher",
      "Database unavailable",
    );
    expect(f.queues.delivery.add.mock.calls[0]).toEqual(
      f.queues.delivery.add.mock.calls[1],
    );
  });

  it("propagates a failure to persist the retry state", async () => {
    const f = fixture(["unknown"]);
    f.repository.fail.mockRejectedValueOnce(new Error("Database unavailable"));
    await expect(f.publish()).rejects.toThrow("Database unavailable");
  });
});
