import { Container } from "@/src/server/container";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  MessageBus,
  GetUserOrganizationsQuery,
  GetOrganizationByIdQuery,
  GetOrganizationMembersQuery,
  GetOrganizationAnalyticsQuery,
  GetOrganizationDashboardQuery,
  CreateOrganizationCommand,
  CreateUserCommand,
  DeleteOrganizationCommand,
  UpdateOrganizationCommand,
  GetUserOrganizationsSchema,
  CreateOrganizationCommandSchema,
  GetOrganizationMembersSchema,
  DeliveryRepository,
  UserRepository,
  normalizeNetwork,
} from "@next-phish/backend";
import { createPermissionProcedure, router } from "../../trpc/procedures";
import {
  ignoredNetworkSchema,
  organizationCreateMemberSchema,
  toRouterPermissions,
  updateOrganizationSchema,
} from "@next-phish/shared";
import { userNotificationQueue } from "@/src/server/queue";
import { db } from "@next-phish/database";
import { auth } from "@/src/server/auth";

const bus = Container.get(MessageBus);

const writeProcedure = createPermissionProcedure(
  toRouterPermissions("organizations", "write"),
);

const readProcedure = createPermissionProcedure(
  toRouterPermissions("organizations", "read"),
);

const readProcedureNoOrg = createPermissionProcedure(
  toRouterPermissions("organizations", "read"),
  { requireOrganization: false },
);

const createMemberProcedure = createPermissionProcedure({ member: ["create"] });

export const organizationRouter = router({
  list: readProcedureNoOrg
    .input(GetUserOrganizationsSchema)
    .query(async ({ ctx, input }) => {
      const handler = Container.get(GetUserOrganizationsQuery);
      return bus.query(handler, {
        ...input,
        userId: ctx.userId,
      });
    }),

  getById: readProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(async ({ ctx }) => {
      const handler = Container.get(GetOrganizationByIdQuery);
      return bus.query(handler, {
        id: ctx.activeOrganizationId,
        userId: ctx.userId,
      });
    }),

  analytics: readProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(({ ctx }) => {
      const handler = Container.get(GetOrganizationAnalyticsQuery);
      return bus.query(handler, {
        organizationId: ctx.activeOrganizationId,
      });
    }),

  dashboard: readProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .query(({ ctx }) => {
      const handler = Container.get(GetOrganizationDashboardQuery);
      return bus.query(handler, {
        organizationId: ctx.activeOrganizationId,
      });
    }),

  listMembers: readProcedure
    .input(GetOrganizationMembersSchema)
    .query(async ({ ctx, input }) => {
      const handler = Container.get(GetOrganizationMembersQuery);
      return bus.query(handler, {
        ...input,
        organizationId: ctx.activeOrganizationId,
        userId: ctx.userId,
      });
    }),

  createMember: createMemberProcedure
    .input(organizationCreateMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }
      try {
        const result = await bus.dispatch(Container.get(CreateUserCommand), {
          name: input.name,
          email: input.email,
          role: "user",
          organizationMode: "existing",
          organizationId: ctx.activeOrganizationId,
        });
        let welcomeQueued = true;
        try {
          await userNotificationQueue.add("welcome-user", result.welcomeJob, {
            jobId: `welcome-user-${result.user.id}`,
            attempts: 5,
            backoff: { type: "exponential", delay: 5_000 },
            removeOnComplete: { age: 86_400 },
          });
        } catch {
          welcomeQueued = false;
        }
        return { user: result.user, welcomeQueued };
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";
        const code =
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : "";
        if (
          code === "P2002" ||
          message.includes("unique") ||
          message.includes("already exists")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A user with this email already exists",
          });
        }
        throw error;
      }
    }),

  lookupMemberEmail: createMemberProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        email: z
          .string()
          .trim()
          .email()
          .transform((value) => value.toLowerCase()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          name: true,
          disabledAt: true,
          members: {
            where: { organizationId: ctx.activeOrganizationId },
            select: { id: true },
          },
        },
      });
      if (!user) return { status: "NEW" as const };
      if (user.disabledAt) return { status: "DISABLED" as const };
      if (user.members.length) return { status: "ALREADY_MEMBER" as const };
      return {
        status: "EXISTING" as const,
        name: user.name,
        email: input.email,
      };
    }),

  addExistingMember: createMemberProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        email: z
          .string()
          .trim()
          .email()
          .transform((value) => value.toLowerCase()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          name: true,
          email: true,
          disabledAt: true,
          members: {
            where: { organizationId: ctx.activeOrganizationId },
            select: { id: true },
          },
        },
      });
      if (!user || user.disabledAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account cannot be added",
        });
      }
      if (user.members.length) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This user is already a member",
        });
      }
      try {
        await auth.api.addMember({
          headers: ctx.headers,
          body: {
            userId: user.id,
            organizationId: ctx.activeOrganizationId,
            role: "member",
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";
        const code =
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : "";
        if (
          code === "P2002" ||
          message.includes("already") ||
          message.includes("unique")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user is already a member",
          });
        }
        throw error;
      }
      return { user: { id: user.id, name: user.name, email: user.email } };
    }),

  resendMemberWelcome: createMemberProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const member = await db.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId: ctx.activeOrganizationId,
            userId: input.userId,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              disabledAt: true,
              passwordSetupRequired: true,
            },
          },
        },
      });
      if (
        !member ||
        member.user.disabledAt ||
        !member.user.passwordSetupRequired
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending active members can receive a setup email",
        });
      }
      const welcomeJob = await Container.get(UserRepository).createWelcomeJob({
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
      });
      await userNotificationQueue.add("welcome-user", welcomeJob, {
        jobId: `welcome-user-${member.user.id}-${Date.now()}`,
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 86_400 },
      });
      return { success: true };
    }),

  create: writeProcedure
    .input(CreateOrganizationCommandSchema)
    .mutation(async ({ ctx, input }) => {
      const handler = Container.get(CreateOrganizationCommand);
      return bus.dispatch(handler, {
        ...input,
        userId: ctx.userId,
        headers: ctx.headers,
      });
    }),

  update: writeProcedure
    .input(
      updateOrganizationSchema.extend({ organizationId: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      const handler = Container.get(UpdateOrganizationCommand);
      return bus.dispatch(handler, {
        organizationId: ctx.activeOrganizationId,
        userId: ctx.userId,
        name: input.name,
        slug: input.slug,
      });
    }),

  setDeliveryEnabled: writeProcedure
    .input(z.object({ deliveryEnabled: z.boolean() }))
    .mutation(({ ctx, input }) =>
      Container.get(DeliveryRepository).setOrganizationDeliveryEnabled(
        ctx.activeOrganizationId,
        input.deliveryEnabled,
      ),
    ),

  listIgnoredNetworks: writeProcedure.query(({ ctx }) =>
    Container.get(DeliveryRepository).listIgnoredNetworks(
      ctx.activeOrganizationId,
    ),
  ),

  createIgnoredNetwork: writeProcedure
    .input(ignoredNetworkSchema.extend({ organizationId: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      const normalized = normalizeNetwork(input.network).canonical;
      return Container.get(DeliveryRepository).createIgnoredNetwork({
        organizationId: ctx.activeOrganizationId,
        createdById: ctx.userId,
        network: input.network,
        normalizedNetwork: normalized,
        description: input.description,
      });
    }),

  listIgnoredNetworkAudits: writeProcedure.query(({ ctx }) =>
    Container.get(DeliveryRepository).listIgnoredNetworkAudits(
      ctx.activeOrganizationId,
    ),
  ),

  deleteIgnoredNetwork: writeProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      Container.get(DeliveryRepository).deleteIgnoredNetwork(
        input.id,
        ctx.activeOrganizationId,
        ctx.userId,
      ),
    ),

  delete: writeProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const handler = Container.get(DeleteOrganizationCommand);
      return bus.dispatch(handler, {
        organizationId: input.organizationId,
        headers: ctx.headers,
      });
    }),
});
