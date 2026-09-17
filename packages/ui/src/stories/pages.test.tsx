import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { PagesListContainer } from "../../../../apps/next-app/src/components/organisms/pages/pages-list-container";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  push: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ page: { list: { invalidate: vi.fn() } } }),
    page: {
      list: {
        useQuery: (input: unknown) => {
          mocks.query(input);
          return {
            data: {
              pages: [
                {
                  id: "p1",
                  name: "Sign in",
                  path: "login",
                  type: "LANDING",
                  status: "ACTIVE",
                  createdById: "u1",
                  createdBy: { id: "u1", name: "Alex" },
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              total: 21,
            },
            isLoading: false,
            refetch: vi.fn(),
          };
        },
      },
      delete: {
        useMutation: ({ onSuccess }: { onSuccess: () => void }) => {
          const [isPending] = useState(false);
          return {
            isPending,
            mutate: (input: unknown) => {
              mocks.remove(input);
              void onSuccess();
            },
          };
        },
      },
    },
  },
}));
beforeEach(() => vi.clearAllMocks());
it("maps type filtering, sorting and pagination to the page list API", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <PagesListContainer />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Page type" }));
  await user.click(screen.getByRole("combobox", { name: "Page type" }));
  await user.click(screen.getByRole("option", { name: "Landing" }));
  await waitFor(() =>
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { status: undefined, type: "LANDING" },
        offset: 0,
      }),
    ),
  );
  await user.click(screen.getByRole("button", { name: /Page name/ }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ sort: [{ field: "name", order: "asc" }] }),
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ offset: 10 }),
  );
});
it("confirms deletion with the exact row id and closes after success", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <PagesListContainer />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Delete: Sign in" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(mocks.remove).toHaveBeenCalledWith({ id: "p1" });
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
