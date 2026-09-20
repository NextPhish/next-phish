import { describe, expect, it } from "vitest";
import {
  CreateTaskSchema,
  CreateTaskStatusSchema,
  ListTasksSchema,
  ReorderTaskStatusesSchema,
  UpdateTaskSchema,
} from "../../src/task";

describe("task validations", () => {
  it("accepts a task with one typed relation", () => {
    expect(
      CreateTaskSchema.parse({
        title: "Review landing page",
        statusId: "status-1",
        priority: "HIGH",
        relation: { type: "PAGE", id: "page-1" },
      }),
    ).toMatchObject({ title: "Review landing page", priority: "HIGH" });
  });

  it("rejects unsupported relation types and empty titles", () => {
    expect(() =>
      CreateTaskSchema.parse({
        title: "",
        statusId: "status-1",
        relation: { type: "USER", id: "user-1" },
      }),
    ).toThrow();
  });

  it("validates Editor.js task descriptions and preserves hostile text as data", () => {
    const description = {
      version: 1 as const,
      blocks: [
        {
          id: "paragraph-1",
          type: "paragraph" as const,
          data: { text: '<img src=x onerror="alert(1)">' },
        },
        {
          type: "header" as const,
          data: { text: "Review", level: 2 },
        },
        {
          type: "list" as const,
          data: { style: "unordered" as const, items: ["One", "Two"] },
        },
      ],
    };

    expect(
      CreateTaskSchema.parse({
        title: "Review landing page",
        statusId: "status-1",
        description,
      }).description,
    ).toEqual(description);
  });

  it("rejects malformed or unsupported task description JSON", () => {
    const base = { title: "Review", statusId: "status-1" };
    expect(() =>
      CreateTaskSchema.parse({
        ...base,
        description: {
          version: 1,
          blocks: [{ type: "script", data: { code: "alert(1)" } }],
        },
      }),
    ).toThrow();
    expect(() =>
      CreateTaskSchema.parse({
        ...base,
        description: {
          version: 1,
          blocks: [
            {
              type: "header",
              data: { text: "Invalid", level: 7, unexpected: true },
            },
          ],
        },
      }),
    ).toThrow();
  });

  it("distinguishes description omission from an explicit null reset", () => {
    expect(UpdateTaskSchema.parse({ id: "task-1" })).not.toHaveProperty(
      "description",
    );
    expect(
      UpdateTaskSchema.parse({ id: "task-1", description: null }),
    ).toHaveProperty("description", null);
    expect(
      CreateTaskSchema.parse({ title: "No details", statusId: "status-1" }),
    ).toHaveProperty("description", null);
  });

  it("bounds status filters and status ordering", () => {
    expect(() =>
      ListTasksSchema.parse({
        statusIds: Array.from({ length: 21 }, (_, index) => String(index)),
      }),
    ).toThrow();
    expect(() => ReorderTaskStatusesSchema.parse({ statusIds: [] })).toThrow();
  });

  it("validates custom status semantics", () => {
    expect(
      CreateTaskStatusSchema.parse({
        name: "Ready for review",
        marksTaskDone: false,
        colorToken: "#5c73ff",
      }),
    ).toEqual({
      name: "Ready for review",
      marksTaskDone: false,
      colorToken: "#5c73ff",
    });
  });
});
