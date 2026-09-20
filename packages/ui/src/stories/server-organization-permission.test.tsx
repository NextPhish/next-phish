import { beforeEach, expect, it, vi } from "vitest";
import { z } from "zod";

const mocks = vi.hoisted(() => ({
  permissionSuccess: true,
  members: [{ userId: "manager-1" }],
}));

vi.mock("@/src/server/auth", () => ({
  auth: {
    api: {
      hasPermission: vi.fn(async () => ({
        success: mocks.permissionSuccess,
        error: null,
      })),
    },
  },
}));

vi.mock("@/src/server/trpc/context", () => ({
  getOrganizationId: async (_ctx: unknown, organizationId?: string) =>
    organizationId ?? "org-1",
}));

vi.mock("@/src/server/container", () => ({
  Container: {
    get: () => ({
      findById: async () => ({ members: mocks.members }),
    }),
  },
}));

vi.mock("@next-phish/backend", () => ({
  OrganizationRepository: class OrganizationRepository {},
}));

import {
  createPermissionProcedure,
  router,
} from "../../../../apps/next-app/src/server/trpc/procedures";

const testRouter = router({
  createMember: createPermissionProcedure({ member: ["create"] })
    .input(z.object({ organizationId: z.string() }))
    .mutation(({ ctx }) => ({ organizationId: ctx.activeOrganizationId })),
});

function caller() {
  return testRouter.createCaller({
    apiKey: null,
    headers: new Headers(),
    userId: "manager-1",
    userState: { role: "user", disabledAt: null, passwordSetupRequired: false },
  } as never);
}

beforeEach(() => {
  mocks.permissionSuccess = true;
  mocks.members = [{ userId: "manager-1" }];
});

it("denies a member-create request when Better Auth reports success false", async () => {
  mocks.permissionSuccess = false;
  await expect(
    caller().createMember({ organizationId: "org-1" }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
});

it("denies an organization where the caller has no membership", async () => {
  mocks.members = [{ userId: "someone-else" }];
  await expect(
    caller().createMember({ organizationId: "foreign" }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
});
