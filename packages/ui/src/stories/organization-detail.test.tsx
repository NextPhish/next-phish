import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizationDetailPresentation } from "../../../../apps/next-app/src/components/organisms/organizations/organization-detail-presentation";
import { OrganizationDetailContainer } from "../../../../apps/next-app/src/components/organisms/organizations/organization-detail-container";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { useDataTableState } from "../index";

const mocks = vi.hoisted(() => ({ memberInputs: [] as unknown[] }));
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
              role: "owner",
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

function PermissionFixture({ role }: { role: string }) {
  const table = useDataTableState();
  return (
    <I18nProvider initialLocale="en">
      <OrganizationDetailPresentation
        model={{
          organization: {
            id: "org",
            name: "Acme",
            slug: "acme",
            logo: null,
            createdAt: new Date(),
            $me: {
              id: "membership",
              userId: "user",
              role,
              createdAt: new Date(),
            },
          },
          analytics: [],
          analyticsLoading: false,
          analyticsError: null,
          onRetryAnalytics: () => {},
          members: {
            rows: [],
            total: 0,
            state: table.state,
            onStateChange: table.onStateChange,
            loading: false,
            error: null,
            onRetry: () => {},
          },
        }}
        settings={<div>Protected settings</div>}
      />
    </I18nProvider>
  );
}

describe("organization detail", () => {
  beforeEach(() => {
    mocks.memberInputs.length = 0;
  });
  it("hides settings from members and shows them to managers", () => {
    const view = render(<PermissionFixture role="member" />);
    expect(screen.queryByText("Protected settings")).not.toBeInTheDocument();
    view.rerender(<PermissionFixture role="admin" />);
    expect(screen.getByText("Protected settings")).toBeInTheDocument();
  });
  it("maps member sorting, filtering, and pagination to the server query", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <OrganizationDetailContainer organizationId="org-1" />
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
