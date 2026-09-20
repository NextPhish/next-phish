import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupDetail } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-detail";
const mocks = vi.hoisted(() => ({
  users: vi.fn(),
  remove: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock(
  "../../../../apps/next-app/src/components/organisms/target-groups/target-group-form",
  () => ({ TargetGroupForm: () => <div>Group form</div> }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/target-groups/target-group-add-user",
  () => ({ TargetGroupAddUser: () => null }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/target-groups/target-group-import",
  () => ({ TargetGroupImport: () => null }),
);
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ targetGroup: { invalidate: mocks.invalidate } }),
    targetGroup: {
      getById: {
        useQuery: () => ({
          data: { id: "group-1", name: "Engineering", status: "ACTIVE" },
          isLoading: false,
        }),
      },
      getUsers: {
        useQuery: (input: unknown) => {
          mocks.users(input);
          return {
            data: {
              users: [
                {
                  id: "user-1",
                  email: "alex@example.com",
                  firstName: "Alex",
                  lastName: "Morgan",
                  position: "Engineer",
                },
              ],
              total: 22,
            },
            isLoading: false,
            refetch: vi.fn(),
          };
        },
      },
      removeUser: {
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
it("queries member pages and removes only the confirmed group member", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupDetail groupId="group-1" />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(mocks.users).toHaveBeenCalledWith(
    expect.objectContaining({
      targetGroupId: "group-1",
      offset: 10,
      limit: 10,
    }),
  );
  await user.click(
    screen.getByRole("button", { name: "Actions: alex@example.com" }),
  );
  await user.click(screen.getByRole("menuitem", { name: "Remove" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Remove Alex Morgan");
  await user.click(screen.getByRole("button", { name: "Remove" }));
  expect(mocks.remove).toHaveBeenCalledWith({
    id: "user-1",
    targetGroupId: "group-1",
  });
  await waitFor(() => expect(mocks.invalidate).toHaveBeenCalled());
});
