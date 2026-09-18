import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { UsersContainer } from "../../../../apps/next-app/src/components/organisms/users/users-container";
import { demoUsers } from "./users-admin.stories";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  setDisabled: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock(
  "../../../../apps/next-app/src/components/organisms/users/create-user-container",
  () => ({ CreateUserContainer: () => null }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/users/delete-user-dialog",
  () => ({ DeleteUserDialog: () => null }),
);
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ user: { list: { invalidate: mocks.invalidate } } }),
    user: {
      list: {
        useQuery: (input: unknown) => {
          mocks.query(input);
          return {
            data: { users: demoUsers, total: 24 },
            isLoading: false,
            refetch: vi.fn(),
          };
        },
      },
      setDisabled: {
        useMutation: ({ onSuccess }: { onSuccess: () => void }) => {
          const [isPending] = useState(false);
          return {
            isPending,
            mutate: (input: unknown) => {
              mocks.setDisabled(input);
              void onSuccess();
            },
          };
        },
      },
    },
  },
}));
beforeEach(() => vi.clearAllMocks());
it("maps admin role/status filters, sort and pagination to the server query", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <UsersContainer />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "System role" }));
  await user.click(screen.getByRole("combobox", { name: "System role" }));
  await user.click(screen.getByRole("option", { name: "Administrator" }));
  await waitFor(() =>
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { role: "admin", status: undefined },
        offset: 0,
      }),
    ),
  );
  await user.click(screen.getByRole("button", { name: /Name/ }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ sort: [{ field: "name", order: "asc" }] }),
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ offset: 10, limit: 10 }),
  );
});
it("confirms deactivate and reactivate with the exact boolean and id", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <UsersContainer />
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Actions: Alex Morgan" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Deactivate" }));
  await user.click(screen.getByRole("button", { name: "Deactivate" }));
  expect(mocks.setDisabled).toHaveBeenCalledWith({
    userId: "admin",
    disabled: true,
  });
  await user.click(screen.getByRole("button", { name: "Actions: Sam Lee" }));
  await user.click(screen.getByRole("menuitem", { name: "Reactivate" }));
  await user.click(screen.getByRole("button", { name: "Reactivate" }));
  expect(mocks.setDisabled).toHaveBeenCalledWith({
    userId: "inactive",
    disabled: false,
  });
});
