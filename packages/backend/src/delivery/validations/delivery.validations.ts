import { z } from "zod";

export const IgnoredNetworkIdSchema = z.object({
  id: z.string().min(1),
});

export type IgnoredNetworkIdInput = z.infer<typeof IgnoredNetworkIdSchema>;
