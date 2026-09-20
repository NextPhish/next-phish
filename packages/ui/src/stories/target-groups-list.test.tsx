import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupList } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-list";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ targetGroup: { list: { invalidate: vi.fn() } } }),
    targetGroup: {
      list: {
        useQuery: (input: unknown) => {
          mocks.query(input);
          return {
            data: {
              targetGroups: [
                {
                  id: "g1",
                  name: "Engineering",
                  status: "ACTIVE",
                  userCount: 22,
                  createdById: "u1",
                  createdBy: { id: "u1", name: "Alex" },
                  updatedAt: new Date(),
                },
              ],
              total: 22,
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
it("maps status filter, server sorting and page changes to the list query", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupList />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Status" }));
  await user.click(screen.getByRole("combobox", { name: "Status" }));
  await user.click(screen.getByRole("option", { name: "Archived" }));
  await waitFor(() =>
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { status: "ARCHIVED" }, offset: 0 }),
    ),
  );
  await user.click(screen.getByRole("button", { name: /Group name/ }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ sort: [{ field: "name", order: "asc" }] }),
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ offset: 10, limit: 10 }),
  );
});
it("confirms exact group deletion in a controlled dialog", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupList />
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Actions: Engineering" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Delete" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(mocks.remove).toHaveBeenCalledWith({ id: "g1" });
});
