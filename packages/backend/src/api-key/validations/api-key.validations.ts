import { z } from "zod";

export const CreateApiKeyInputSchema = z.object({
  name: z.string().max(32).optional(),
  organizationIds: z.array(z.string()).optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  permissions: z.any().optional(),
  rateLimitEnabled: z.boolean().optional(),
  rateLimitMax: z.number().int().min(1).optional(),
  rateLimitTimeWindow: z.number().int().min(1000).optional(),
});

export const DeleteApiKeyInputSchema = z.object({
  keyId: z.string(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInputSchema>;
export type DeleteApiKeyInput = z.infer<typeof DeleteApiKeyInputSchema>;
