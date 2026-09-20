import { z } from "zod";

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const taskStatusColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid status color");
export const taskResourceTypeSchema = z.enum([
  "CAMPAIGN",
  "SCHEDULE",
  "PAGE",
  "EMAIL_TEMPLATE",
  "TARGET_GROUP",
  "SENDING_PROFILE",
]);

export const taskRelationSchema = z
  .object({ type: taskResourceTypeSchema, id: z.string().min(1) })
  .nullable()
  .optional();

const taskBlockIdSchema = z.string().trim().min(1).max(100).optional();
const taskParagraphBlockSchema = z
  .object({
    id: taskBlockIdSchema,
    type: z.literal("paragraph"),
    data: z.object({ text: z.string().max(20_000) }).strict(),
  })
  .strict();
const taskHeaderBlockSchema = z
  .object({
    id: taskBlockIdSchema,
    type: z.literal("header"),
    data: z
      .object({
        text: z.string().max(2_000),
        level: z.number().int().min(1).max(6),
      })
      .strict(),
  })
  .strict();
const taskListBlockSchema = z
  .object({
    id: taskBlockIdSchema,
    type: z.literal("list"),
    data: z
      .object({
        style: z.enum(["ordered", "unordered"]),
        items: z.array(z.string().max(10_000)).max(200),
      })
      .strict(),
  })
  .strict();
export const taskDescriptionBlockSchema = z.discriminatedUnion("type", [
  taskParagraphBlockSchema,
  taskHeaderBlockSchema,
  taskListBlockSchema,
]);

export const taskDescriptionSchema = z
  .object({
    version: z.literal(1),
    blocks: z.array(taskDescriptionBlockSchema).max(500),
  })
  .strict();

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: taskDescriptionSchema.nullable().optional().default(null),
  statusId: z.string().min(1, "Status is required"),
  priority: taskPrioritySchema.default("MEDIUM"),
  assigneeId: z.string().nullable().optional(),
  dueAt: z
    .string()
    .nullable()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Choose a valid due date",
    }),
  relation: taskRelationSchema,
});

export const taskStatusFormSchema = z.object({
  name: z.string().trim().min(1, "Status name is required").max(40),
  colorToken: taskStatusColorSchema.default("#64748b"),
  marksTaskDone: z.boolean().default(false),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskDescription = z.infer<typeof taskDescriptionSchema>;
export type TaskDescriptionBlock = z.infer<typeof taskDescriptionBlockSchema>;
export type TaskStatusFormValues = z.infer<typeof taskStatusFormSchema>;
export type TaskResourceType = z.infer<typeof taskResourceTypeSchema>;
