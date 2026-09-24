import { z } from "zod";
import {
  ignoredNetworkSchema,
  updateOrganizationSchema,
} from "@next-phish/shared";

const sortFieldSchema = z.enum(["name", "slug", "createdAt"]);
const sortOrderSchema = z.enum(["asc", "desc"]);

const sortSchema = z.object({
  field: sortFieldSchema,
  order: sortOrderSchema,
});

export const GetUserOrganizationsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sort: z.array(sortSchema).optional(),
  filters: z
    .object({
      role: z.string().optional(),
    })
    .optional(),
});

export type GetUserOrganizationsInput = z.infer<
  typeof GetUserOrganizationsSchema
>;

export const CreateOrganizationCommandSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only",
    ),
});

export type CreateOrganizationCommandInput = z.infer<
  typeof CreateOrganizationCommandSchema
>;

export const OrganizationIdSchema = z.object({
  organizationId: z.string().min(1),
});

export const OrganizationMemberEmailSchema = z.object({
  organizationId: z.string().min(1),
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const ResendOrganizationMemberWelcomeSchema = z.object({
  organizationId: z.string().min(1),
  userId: z.string().min(1),
});

export const UpdateOrganizationInputSchema = updateOrganizationSchema.extend({
  organizationId: z.string().min(1),
});

export const OrganizationDeliveryEnabledSchema = z.object({
  deliveryEnabled: z.boolean(),
});

export const OrganizationIgnoredNetworkSchema = ignoredNetworkSchema.extend({
  organizationId: z.string().min(1),
});

export const DeleteOrganizationInputSchema = z.object({
  organizationId: z.string(),
});

export type OrganizationIdInput = z.infer<typeof OrganizationIdSchema>;
export type OrganizationMemberEmailInput = z.infer<
  typeof OrganizationMemberEmailSchema
>;
export type ResendOrganizationMemberWelcomeInput = z.infer<
  typeof ResendOrganizationMemberWelcomeSchema
>;
export type UpdateOrganizationInput = z.infer<
  typeof UpdateOrganizationInputSchema
>;
export type OrganizationDeliveryEnabledInput = z.infer<
  typeof OrganizationDeliveryEnabledSchema
>;
export type OrganizationIgnoredNetworkInput = z.infer<
  typeof OrganizationIgnoredNetworkSchema
>;
export type DeleteOrganizationInput = z.infer<
  typeof DeleteOrganizationInputSchema
>;
