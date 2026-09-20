import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { OrganizationList } from "../../../../apps/next-app/src/components/organisms/organizations";
import { OrganizationListView } from "../../../../apps/next-app/src/components/organisms/organizations/organization-list/parts/organization-list-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { useDataTableState } from "../index";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  owned: 1,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
}));
vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    useActiveOrganization: () => ({ data: null }),
    organization: { setActive: vi.fn() },
  },
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ organization: { list: { invalidate: vi.fn() } } }),
    organization: {
      list: {
        useQuery: (input: Record<string, unknown>) => {
          mocks.query(input);
          return {
            data:
              input.limit === 1
                ? { organizations: [], total: mocks.owned }
                : {
                    organizations: [
                      {
                        id: "owner",
                        name: "Owned team",
                        slug: "owned",
                        createdAt: new Date(),
                        $me: { role: "owner" },
                      },
                      {
                        id: "member",
                        name: "Shared team",
                        slug: "shared",
                        createdAt: new Date(),
                        $me: { role: "member" },
                      },
                    ],
                    total: 22,
                  },
            isLoading: false,
          };
        },
      },
      delete: {
        useMutation: ({ onError }: { onError: () => void }) => {
          const [isPending] = useState(false);
          return {
            isPending,
            mutate: (input: unknown) => {
              mocks.remove(input);
              onError();
            },
          };
        },
      },
      create: {
        useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.owned = 1;
});
it("retains the added role filter and sends role/page state to the API", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <OrganizationList />
    </I18nProvider>,
  );
  expect(
    screen.queryByRole("menuitem", { name: "Delete" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Role" }));
  await user.click(screen.getByRole("combobox", { name: "Role" }));
  await user.click(screen.getByRole("option", { name: "Owner" }));
  await waitFor(() =>
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { role: "owner" },
        offset: 0,
        limit: 10,
      }),
    ),
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ offset: 10, filters: { role: "owner" } }),
  );
});
it("opens the create organization dialog from the list action", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <OrganizationList />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Create organization" }));
  expect(
    screen.getByRole("dialog", { name: "Create organization" }),
  ).toBeInTheDocument();
});
it("only exposes eligible owner deletion and keeps a failed deletion in its dialog", async () => {
  mocks.owned = 2;
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <OrganizationList />
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Actions: Shared team" }),
  );
  expect(
    screen.queryByRole("menuitem", { name: "Delete" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Actions: Owned team" }));
  await user.click(screen.getByRole("menuitem", { name: "Delete" }));
  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(mocks.remove).toHaveBeenCalledWith({ organizationId: "owner" });
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Could not delete the organization",
  );
});

function EmptyList({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  const table = useDataTableState({ search: "no matches" });
  return (
    <I18nProvider initialLocale="en">
      <OrganizationListView
        {...table}
        organizations={[]}
        total={0}
        canCreate={canCreate}
        onCreate={onCreate}
        canDeleteOrganization={() => false}
        loading={false}
        onRetry={() => undefined}
        onManage={() => undefined}
        onDeleteRequest={() => undefined}
        deleting={null}
        deletePending={false}
        onDeleteCancel={() => undefined}
        onDeleteConfirm={() => undefined}
      />
    </I18nProvider>
  );
}

it("shows create for an owner even when the filtered result is empty", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<EmptyList canCreate onCreate={onCreate} />);
  await user.click(screen.getByRole("button", { name: "Create organization" }));
  expect(onCreate).toHaveBeenCalledOnce();
});

it("hides create when the user cannot create organizations", () => {
  render(<EmptyList canCreate={false} onCreate={vi.fn()} />);
  expect(
    screen.queryByRole("button", { name: "Create organization" }),
  ).not.toBeInTheDocument();
});

it("opens organization details when its row is activated", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <OrganizationList />
    </I18nProvider>,
  );
  await user.click(screen.getByText("owned"));
  expect(mocks.push).toHaveBeenCalledWith("/organizations/owner");
});
