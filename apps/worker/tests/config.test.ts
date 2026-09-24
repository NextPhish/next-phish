import { describe, expect, it } from "vitest";
import { loadWorkerConfig } from "../src/config";

describe("worker configuration", () => {
  it("preserves the existing concurrency and throughput defaults", () => {
    const config = loadWorkerConfig({});
    expect(config.concurrency).toEqual({
      "user-notifications": 5,
      jobs: 5,
      imports: 3,
      "schedule-execution": 1,
      materialization: 2,
      "delivery-feeder": 1,
      delivery: 10,
      "delivery-events": 5,
      "tracking-events": 10,
      outbox: 1,
    });
    expect(config.deliveryLimiter).toEqual({ max: 60, duration: 60_000 });
    expect(config.outbox).toEqual({ batch: 100, intervalMs: 5_000 });
  });

  it.each([
    ["USER_NOTIFICATIONS_CONCURRENCY", "user-notifications"],
    ["JOBS_CONCURRENCY", "jobs"],
    ["IMPORTS_CONCURRENCY", "imports"],
    ["SCHEDULE_EXECUTION_CONCURRENCY", "schedule-execution"],
    ["MATERIALIZATION_CONCURRENCY", "materialization"],
    ["DELIVERY_FEEDER_CONCURRENCY", "delivery-feeder"],
    ["DELIVERY_CONCURRENCY", "delivery"],
    ["DELIVERY_EVENTS_CONCURRENCY", "delivery-events"],
    ["TRACKING_EVENTS_CONCURRENCY", "tracking-events"],
    ["OUTBOX_CONCURRENCY", "outbox"],
  ])("allows configuring %s independently", (variable, queue) => {
    const config = loadWorkerConfig({ [variable]: "7" });
    expect(config.concurrency[queue as keyof typeof config.concurrency]).toBe(
      7,
    );
  });

  it.each([
    "",
    " ",
    "0",
    "-1",
    "1.5",
    "NaN",
    "Infinity",
    "many",
    "9007199254740992",
  ])("rejects invalid concurrency %j", (value) => {
    expect(() => loadWorkerConfig({ DELIVERY_CONCURRENCY: value })).toThrow(
      "DELIVERY_CONCURRENCY",
    );
  });

  it.each([
    { DELIVERY_RATE_DURATION_MS: "0" },
    { OUTBOX_CLAIM_BATCH: "501" },
    { REDIS_PORT: "65536" },
    { LOG_LEVEL: "verbose" },
    { SCHEDULE_POLL_INTERVAL_MS: "-1" },
  ])("rejects invalid operational settings %j", (env) => {
    expect(() => loadWorkerConfig(env)).toThrow();
  });
});
