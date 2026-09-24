import { EventEmitter } from "node:events";
import type { Job, WorkerOptions } from "bullmq";
import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/logger";

vi.mock("bullmq", () => ({
  Worker: class extends EventEmitter {},
}));
import { createWorker, strictHandler } from "../src/workers/create-worker";

function job(name: string): Job {
  return {
    id: "job-1",
    name,
    attemptsMade: 2,
    data: { magicLink: "secret-link" },
  } as Job;
}

describe("worker dispatch and logging", () => {
  it("dispatches a known job with its original data", async () => {
    const handler = vi.fn().mockResolvedValue("done");
    const work = job("known");
    await expect(strictHandler({ known: handler })(work)).resolves.toBe("done");
    expect(handler).toHaveBeenCalledWith(work);
  });

  it.each(["unknown", "constructor", "__proto__", "toString"])(
    "rejects unregistered job %s",
    async (name) => {
      await expect(strictHandler({})(job(name))).rejects.toThrow(
        `Unknown job type: ${name}`,
      );
    },
  );

  it("logs failures, stalls and worker errors with queue/job context and no job data", () => {
    const lines: string[] = [];
    const logger = createLogger(
      {},
      {
        write: (line) => {
          lines.push(line);
        },
      },
    );
    const worker = createWorker(
      "delivery",
      {},
      { concurrency: 4 } as WorkerOptions,
      logger,
    );
    worker.emit(
      "failed",
      job("deliver-recipient"),
      new Error("Provider failed"),
    );
    worker.emit("stalled", "job-1", "active");
    worker.emit("error", new Error("Connection failed"));
    worker.emit("completed", job("deliver-recipient"));
    expect(lines.map((line) => JSON.parse(line))).toEqual([
      expect.objectContaining({
        level: 50,
        queue: "delivery",
        jobId: "job-1",
        jobName: "deliver-recipient",
        attemptsMade: 2,
        err: expect.objectContaining({ message: "Provider failed" }),
      }),
      expect.objectContaining({ level: 40, queue: "delivery", jobId: "job-1" }),
      expect.objectContaining({
        level: 50,
        queue: "delivery",
        err: expect.objectContaining({ message: "Connection failed" }),
      }),
    ]);
    expect(lines.join("")).not.toContain("secret-link");
  });

  it("redacts sensitive fields and serializes errors", () => {
    const lines: string[] = [];
    const logger = createLogger(
      {},
      {
        write: (line) => {
          lines.push(line);
        },
      },
    );
    logger.error(
      {
        err: new Error("Failure"),
        payload: { email: "private" },
        magicLink: "secret",
        job: { data: { token: "secret" } },
      },
      "Failed",
    );
    expect(JSON.parse(lines[0])).toMatchObject({
      payload: "[Redacted]",
      magicLink: "[Redacted]",
      job: { data: "[Redacted]" },
      err: { message: "Failure" },
    });
  });
});
