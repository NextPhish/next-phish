import { z } from "zod";

export const CreateSiteImportSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  includeAssets: z.boolean().default(false),
});

export const GetSiteImportByJobIdSchema = z.object({
  jobId: z.string(),
});

export const ListSiteImportsSchema = z
  .object({
    search: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
  })
  .optional();

export type CreateSiteImportInput = z.infer<typeof CreateSiteImportSchema>;
export type GetSiteImportByJobIdInput = z.infer<
  typeof GetSiteImportByJobIdSchema
>;
export type ListSiteImportsInput = z.infer<typeof ListSiteImportsSchema>;
