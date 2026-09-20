import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationDetail } from "../../../../apps/next-app/src/components/organisms/organizations";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const mocks = vi.hoisted(() => ({
  memberInputs: [] as unknown[],
  role: "owner",
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
    organization: {
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
