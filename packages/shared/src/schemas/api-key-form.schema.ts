import { z } from "zod";

/** UI form values; the API request is mapped separately by the application. */
export const createApiKeyFormSchema = z
  .object({
    name: z.string().max(32),
    limitToOrganizations: z.boolean(),
    organizationIds: z.array(z.string()),
    permissions: z.record(z.boolean()),
    expiresInDays: z.number().int().min(1).max(365).nullable(),
    rateLimitEnabled: z.boolean(),
    rateLimitMax: z.number().int().min(1).nullable(),
    rateLimitTimeWindow: z.number().int().min(1000).nullable(),
  })
  .superRefine((values, context) => {
    if (values.limitToOrganizations && values.organizationIds.length === 0)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationIds"],
        message: "Select at least one organization",
      });
    if (values.rateLimitEnabled && values.rateLimitMax === null)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rateLimitMax"],
        message: "Enter a request limit",
      });
    if (values.rateLimitEnabled && values.rateLimitTimeWindow === null)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rateLimitTimeWindow"],
        message: "Select a time window",
      });
  });
export type CreateApiKeyFormValues = z.infer<typeof createApiKeyFormSchema>;
