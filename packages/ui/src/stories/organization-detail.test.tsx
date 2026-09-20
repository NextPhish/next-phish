import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationDetail } from "../../../../apps/next-app/src/components/organisms/organizations";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const mocks = vi.hoisted(() => ({
  memberInputs: [] as unknown[],
  role: "owner",
  createMember: vi.fn(),
  resendMemberWelcome: vi.fn(),
  lookupMemberEmail: vi.fn(),
  addExistingMember: vi.fn(),
  invalidateMembers: vi.fn(),
}));
vi.mock("@/src/components/organisms/organization-settings", () => ({
  OrganizationSettings: () => <div>Settings form</div>,
}));
vi.mock("@/src/components/molecules/charts", () => ({
  CampaignsChart: () => <div>Campaign chart</div>,
  EmailStatsChart: () => <div>Email chart</div>,
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      organization: {
        listMembers: { invalidate: mocks.invalidateMembers },
      },
    }),
    organization: {
      lookupMemberEmail: {
        useMutation: () => ({ mutateAsync: mocks.lookupMemberEmail }),
      },
      addExistingMember: {
        useMutation: () => ({
          mutateAsync: mocks.addExistingMember,
          isPending: false,
        }),
      },
      createMember: {
        useMutation: () => ({ mutateAsync: mocks.createMember }),
      },
      resendMemberWelcome: {
        useMutation: () => ({
          mutateAsync: mocks.resendMemberWelcome,
          isPending: false,
        }),
      },
      getById: {
        useQuery: () => ({
          data: {
            id: "org-1",
            name: "Acme",
            slug: "acme",
            logo: null,
            createdAt: new Date(),
            $me: {
              id: "m-1",
              userId: "u-1",
              role: mocks.role,
              createdAt: new Date(),
            },
          },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        }),
      },
      analytics: {
        useQuery: () => ({
          data: { months: [] },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        }),
      },
      listMembers: {
        useQuery: (input: unknown) => {
          mocks.memberInputs.push(input);
          return {
            data: {
              members: [
                {
                  id: "m-1",
                  userId: "u-1",
                  role: "owner",
                  createdAt: new Date(),
                  user: {
                    name: "Alex",
                    email: "alex@example.com",
                    image: null,
                    passwordSetupRequired: true,
                    disabledAt: null,
                  },
                },
              ],
              total: 25,
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
          };
        },
      },
    },
  },
}));

describe("organization detail", () => {
  beforeEach(() => {
    mocks.memberInputs.length = 0;
    mocks.role = "owner";
    mocks.createMember.mockReset();
    mocks.lookupMemberEmail.mockReset().mockResolvedValue({ status: "NEW" });
    mocks.addExistingMember.mockReset().mockResolvedValue({ user: {} });
    mocks.createMember.mockResolvedValue({ welcomeQueued: true, user: {} });
    mocks.resendMemberWelcome.mockReset();
    mocks.resendMemberWelcome.mockResolvedValue({ success: true });
    mocks.invalidateMembers.mockReset();
    mocks.invalidateMembers.mockResolvedValue(undefined);
  });
  it("adds a member to the displayed organization and refreshes the table", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add member" }));
    await user.type(
      screen.getByRole("textbox", { name: "Email" }),
      "NEW@EXAMPLE.COM",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      await screen.findByRole("textbox", { name: "Name" }),
      "New Member",
    );
    await user.click(
      screen.getByRole("button", { name: "Add member and send invite" }),
    );
    expect(mocks.createMember).toHaveBeenCalledWith({
      organizationId: "org-1",
      name: "New Member",
      email: "new@example.com",
    });
    expect(mocks.invalidateMembers).toHaveBeenCalled();
  });
  it("keeps the dialog values after a create failure", async () => {
    mocks.createMember.mockRejectedValueOnce(new Error("failed"));
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add member" }));
    await user.type(
      screen.getByRole("textbox", { name: "Email" }),
      "new@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      await screen.findByRole("textbox", { name: "Name" }),
      "New Member",
    );
    await user.click(
      screen.getByRole("button", { name: "Add member and send invite" }),
    );
    expect(
      await screen.findByText("The member could not be added. Try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue(
      "new@example.com",
    );
  });
  it("confirms before granting an existing account organization access", async () => {
    mocks.lookupMemberEmail.mockResolvedValueOnce({
      status: "EXISTING",
      name: "Existing",
      email: "existing@example.com",
    });
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add member" }));
    await user.type(
      screen.getByRole("textbox", { name: "Email" }),
      "existing@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByText(/only adds organization membership/i),
    ).toBeInTheDocument();
    expect(mocks.addExistingMember).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Add to organization" }),
    );
    expect(mocks.addExistingMember).toHaveBeenCalledWith({
      organizationId: "org-1",
      email: "existing@example.com",
    });
  });
  it("rechecks an edited email without requiring a new-user name", async () => {
    mocks.lookupMemberEmail
      .mockResolvedValueOnce({ status: "NEW" })
      .mockResolvedValueOnce({
        status: "EXISTING",
        name: "Existing",
        email: "existing@example.com",
      });
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add member" }));
    const email = screen.getByRole("textbox", { name: "Email" });
    await user.type(email, "new@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      await screen.findByRole("textbox", { name: "Name" }),
    ).toBeInTheDocument();
    await user.clear(email);
    await user.type(email, "existing@example.com");
    await user.click(
      screen.getByRole("button", { name: "Add member and send invite" }),
    );
    expect(
      await screen.findByText(/only adds organization membership/i),
    ).toBeInTheDocument();
    expect(mocks.createMember).not.toHaveBeenCalled();
  });
  it("recovers when the member was created but the setup email was not queued", async () => {
    mocks.createMember.mockResolvedValueOnce({
      welcomeQueued: false,
      user: { id: "user-2" },
    });
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Add member" }));
    await user.type(
      screen.getByRole("textbox", { name: "Email" }),
      "new@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      await screen.findByRole("textbox", { name: "Name" }),
      "New Member",
    );
    await user.click(
      screen.getByRole("button", { name: "Add member and send invite" }),
    );
    expect(
      await screen.findByText(/could not send their setup email/i),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry setup email" }));
    expect(mocks.resendMemberWelcome).toHaveBeenCalledWith({
      organizationId: "org-1",
      userId: "user-2",
    });
  });
  it("can resend setup email for a pending member after reopening the page", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Retry setup email" }),
    );
    expect(mocks.resendMemberWelcome).toHaveBeenCalledWith({
      organizationId: "org-1",
      userId: "u-1",
    });
  });
  it("hides settings from members and shows them to managers", () => {
    mocks.role = "member";
    const view = render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    expect(screen.queryByText("Settings form")).not.toBeInTheDocument();
    mocks.role = "admin";
    view.rerender(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    expect(screen.getByText("Settings form")).toBeInTheDocument();
  });
  it("maps member sorting, filtering, and pagination to the server query", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetail organizationId="org-1" />
      </I18nProvider>,
    );
    expect(mocks.memberInputs.at(-1)).toMatchObject({
      organizationId: "org-1",
      offset: 0,
      limit: 10,
    });
    await user.click(screen.getByRole("button", { name: "Role" }));
    expect(mocks.memberInputs.at(-1)).toMatchObject({
      sort: [{ field: "role", order: "asc" }],
      offset: 0,
      limit: 10,
    });
    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(screen.getByRole("menuitem", { name: "Role" }));
    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await user.click(screen.getByRole("option", { name: "Admin" }));
    expect(mocks.memberInputs.at(-1)).toMatchObject({
      filters: { role: "admin" },
      offset: 0,
      limit: 10,
    });
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(mocks.memberInputs.at(-1)).toMatchObject({
      filters: { role: "admin" },
      offset: 10,
      limit: 10,
    });
  });
});
