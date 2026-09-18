import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { useState } from "react";
import { OrganizationListContainer } from "../../../../apps/next-app/src/components/organisms/organizations/organization-list-container";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
  owned: 1,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
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
      <OrganizationListContainer />
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
it("only exposes eligible owner deletion and keeps a failed deletion in its dialog", async () => {
  mocks.owned = 2;
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <OrganizationListContainer />
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
