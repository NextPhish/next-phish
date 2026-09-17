import { z } from "zod";

export const sendingProfileFormSchema = z.object({
  name: z.string().trim().min(1),
  providerType: z.string().min(1),
  fromName: z.string().trim().min(1),
  fromEmail: z.string().email(),
  replyToEmail: z
    .string()
    .email()
    .or(z.literal(""))
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  isDefault: z.boolean(),
  providerConfig: z.record(z.string()),
});

export type SendingProfileFormValues = z.infer<typeof sendingProfileFormSchema>;
