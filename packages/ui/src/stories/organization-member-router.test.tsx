import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const mocks = vi.hoisted(() => ({
  permission: true,
  members: [{ userId: "manager-1" }],
  existingUser: null as null | {
    id: string;
    name?: string;
    email?: string;
    disabledAt?: Date | null;
    members?: Array<{ id: string }>;
  },
  member: null as null | {
    user: {
      id: string;
      name: string;
      email: string;
      disabledAt: Date | null;
      passwordSetupRequired: boolean;
    };
  },
  dispatch: vi.fn(),
  queueAdd: vi.fn(),
  createWelcomeJob: vi.fn(),
  addMember: vi.fn(),
}));

vi.mock("@/src/server/auth", () => ({
  auth: {
    api: {
      hasPermission: vi.fn(async () => ({ success: mocks.permission })),
      addMember: mocks.addMember,
    },
  },
}));

vi.mock("@/src/server/trpc/context", () => ({
  getOrganizationId: async (_ctx: unknown, organizationId?: string) =>
    organizationId ?? "org-1",
}));

vi.mock("@next-phish/backend", () => {
  class MessageBus {}
  class OrganizationRepository {}
  class UserRepository {}
  class DeliveryRepository {}
  class GetUserOrganizationsQuery {}
  class GetOrganizationByIdQuery {}
  class GetOrganizationMembersQuery {}
  class GetOrganizationAnalyticsQuery {}
  class GetOrganizationDashboardQuery {}
  class CreateOrganizationCommand {}
  class CreateUserCommand {}
  class DeleteOrganizationCommand {}
  class UpdateOrganizationCommand {}
  return {
    MessageBus,
    OrganizationRepository,
    UserRepository,
    DeliveryRepository,
    GetUserOrganizationsQuery,
    GetOrganizationByIdQuery,
    GetOrganizationMembersQuery,
    GetOrganizationAnalyticsQuery,
    GetOrganizationDashboardQuery,
    CreateOrganizationCommand,
    CreateUserCommand,
    DeleteOrganizationCommand,
    UpdateOrganizationCommand,
    GetUserOrganizationsSchema: z.object({}).passthrough(),
    CreateOrganizationCommandSchema: z.object({}).passthrough(),
    GetOrganizationMembersSchema: z.object({}).passthrough(),
    normalizeNetwork: (value: string) => value,
  };
});

vi.mock("@/src/server/container", () => {
  return {
    Container: {
      get: (token: { name?: string }) => {
        if (token.name === "MessageBus")
          return { dispatch: mocks.dispatch, query: vi.fn() };
        if (token.name === "OrganizationRepository")
          return { findById: async () => ({ members: mocks.members }) };
        if (token.name === "UserRepository")
          return { createWelcomeJob: mocks.createWelcomeJob };
        return {};
      },
    },
  };
});

vi.mock("@/src/server/queue", () => ({
  userNotificationQueue: { add: mocks.queueAdd },
}));

vi.mock("@next-phish/database", () => ({
  db: {
    user: { findUnique: vi.fn(async () => mocks.existingUser) },
    member: { findUnique: vi.fn(async () => mocks.member) },
  },
}));
vi.mock("../../../../packages/database/src/client", () => ({
  db: {
    user: { findUnique: vi.fn(async () => mocks.existingUser) },
    member: { findUnique: vi.fn(async () => mocks.member) },
  },
}));

import { organizationRouter } from "../../../../apps/next-app/src/server/modules/organization/organization.router";

function caller() {
  return organizationRouter.createCaller({
    apiKey: null,
    headers: new Headers(),
    userId: "manager-1",
    userState: { role: "user", disabledAt: null, passwordSetupRequired: false },
    session: {
      user: { id: "manager-1" },
      session: { activeOrganizationId: "org-1" },
    },
  } as never);
}

beforeEach(() => {
  mocks.permission = true;
  mocks.members = [{ userId: "manager-1" }];
  mocks.existingUser = null;
  mocks.member = null;
  mocks.dispatch.mockReset().mockResolvedValue({
    user: { id: "user-1", name: "New User", email: "new@example.com" },
    welcomeJob: { userId: "user-1", token: "token" },
  });
  mocks.queueAdd.mockReset().mockResolvedValue({ id: "job-1" });
  mocks.createWelcomeJob
    .mockReset()
    .mockResolvedValue({ userId: "user-1", token: "new-token" });
  mocks.addMember.mockReset().mockResolvedValue({ id: "member-1" });
});

describe("organization member router", () => {
  it("uses the real schema and forces user/member organization semantics", async () => {
    await caller().createMember({
      organizationId: "org-1",
      name: "  New User  ",
      email: "NEW@EXAMPLE.COM",
      role: "admin",
      organizationMode: "create",
      requestedRole: "owner",
    } as never);

    expect(mocks.dispatch).toHaveBeenCalledWith(expect.anything(), {
      name: "New User",
      email: "new@example.com",
      role: "user",
      organizationMode: "existing",
      organizationId: "org-1",
    });
  });

  it("denies creation without permission", async () => {
    mocks.permission = false;
    await expect(
      caller().createMember({
        organizationId: "org-1",
        name: "User",
        email: "user@example.com",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("rejects an existing email before dispatch", async () => {
    mocks.existingUser = { id: "existing", members: [] };
    await expect(
      caller().createMember({
        organizationId: "org-1",
        name: "User",
        email: "user@example.com",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });

  it("returns the created user when welcome queueing fails", async () => {
    mocks.queueAdd.mockRejectedValueOnce(new Error("queue unavailable"));
    await expect(
      caller().createMember({
        organizationId: "org-1",
        name: "User",
        email: "user@example.com",
      }),
    ).resolves.toMatchObject({ user: { id: "user-1" }, welcomeQueued: false });
  });

  it("adds an existing active account with a forced member role", async () => {
    mocks.existingUser = {
      id: "existing",
      name: "Existing",
      email: "existing@example.com",
      disabledAt: null,
      members: [],
    };
    await caller().addExistingMember({
      organizationId: "org-1",
      email: "EXISTING@example.com",
      role: "owner",
    } as never);
    expect(mocks.addMember).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { userId: "existing", organizationId: "org-1", role: "member" },
      }),
    );
  });

  it("denies existing-account lookup and addition in a foreign organization", async () => {
    mocks.members = [{ userId: "someone-else" }];
    await expect(
      caller().lookupMemberEmail({
        organizationId: "foreign",
        email: "existing@example.com",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller().addExistingMember({
        organizationId: "foreign",
        email: "existing@example.com",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.addMember).not.toHaveBeenCalled();
  });

  it("rejects disabled and already-member existing accounts", async () => {
    mocks.existingUser = {
      id: "existing",
      disabledAt: new Date(),
      members: [],
    };
    await expect(
      caller().addExistingMember({
        organizationId: "org-1",
        email: "existing@example.com",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    mocks.existingUser = {
      id: "existing",
      disabledAt: null,
      members: [{ id: "member" }],
    };
    await expect(
      caller().addExistingMember({
        organizationId: "org-1",
        email: "existing@example.com",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(mocks.addMember).not.toHaveBeenCalled();
  });

  it("maps a concurrent duplicate membership from BetterAuth to conflict", async () => {
    mocks.existingUser = {
      id: "existing",
      name: "Existing",
      email: "existing@example.com",
      disabledAt: null,
      members: [],
    };
    mocks.addMember.mockRejectedValueOnce(new Error("Member already exists"));
    await expect(
      caller().addExistingMember({
        organizationId: "org-1",
        email: "existing@example.com",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it.each([
    ["foreign member", null],
    [
      "disabled member",
      {
        user: {
          id: "user-1",
          name: "User",
          email: "user@example.com",
          disabledAt: new Date(),
          passwordSetupRequired: true,
        },
      },
    ],
    [
      "completed member",
      {
        user: {
          id: "user-1",
          name: "User",
          email: "user@example.com",
          disabledAt: null,
          passwordSetupRequired: false,
        },
      },
    ],
  ])("denies resend for a %s", async (_label, member) => {
    mocks.member = member;
    await expect(
      caller().resendMemberWelcome({
        organizationId: "org-1",
        userId: "user-1",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.queueAdd).not.toHaveBeenCalled();
  });

  it("queues a fresh welcome for a pending active member", async () => {
    mocks.member = {
      user: {
        id: "user-1",
        name: "User",
        email: "user@example.com",
        disabledAt: null,
        passwordSetupRequired: true,
      },
    };
    await expect(
      caller().resendMemberWelcome({
        organizationId: "org-1",
        userId: "user-1",
      }),
    ).resolves.toEqual({ success: true });
    expect(mocks.createWelcomeJob).toHaveBeenCalledWith({
      userId: "user-1",
      name: "User",
      email: "user@example.com",
    });
    expect(mocks.queueAdd).toHaveBeenCalledWith(
      "welcome-user",
      { userId: "user-1", token: "new-token" },
      expect.objectContaining({
        jobId: expect.stringMatching(/^welcome-user-user-1-/),
        attempts: 5,
      }),
    );
  });
});
