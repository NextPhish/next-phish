import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { DeleteUser } from "../../../../apps/next-app/src/components/organisms/users/delete-user";
import { demoPreview, demoUsers } from "./users-admin.stories";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  remove: vi.fn(),
  invalidate: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ user: { list: { invalidate: mocks.invalidate } } }),
    user: {
      deletionPreview: { useQuery: (input: unknown) => mocks.query(input) },
      delete: {
        useMutation: () => ({ mutateAsync: mocks.remove, isPending: false }),
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue({
    data: demoPreview,
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  });
  mocks.remove.mockResolvedValue(undefined);
  mocks.invalidate.mockResolvedValue(undefined);
});
function setup(onClose = vi.fn()) {
  const view = render(
    <I18nProvider initialLocale="en">
      <DeleteUser user={demoUsers[0]!} onClose={onClose} />
    </I18nProvider>,
  );
  return { user: userEvent.setup(), onClose, ...view };
}
it("blocks permanent deletion until a current successful preview exists", async () => {
  mocks.query.mockReturnValue({
    data: undefined,
    isLoading: true,
    isFetching: true,
    refetch: mocks.refetch,
  });
  const { user, rerender } = setup();
  expect(
    screen.getByRole("button", { name: "Delete permanently" }),
  ).toBeDisabled();
  mocks.query.mockReturnValue({
    data: { ...demoPreview, userId: "other" },
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  });
  rerender(
    <I18nProvider initialLocale="en">
      <DeleteUser user={demoUsers[0]!} onClose={() => {}} />
    </I18nProvider>,
  );
  expect(
    screen.getByRole("button", { name: "Delete permanently" }),
  ).toBeDisabled();
  await user.click(screen.getByRole("button", { name: /Try again/i }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(mocks.remove).not.toHaveBeenCalled();
});
it("sends the selected orphan action with the previewed user and keeps failures visible", async () => {
  mocks.remove.mockRejectedValueOnce(new Error("private error"));
  const { user, onClose } = setup();
  expect(screen.getByText("Acme")).toBeInTheDocument();
  expect(screen.getByText(/mira@example.com/)).toBeInTheDocument();
  await user.click(
    screen.getByRole("radio", { name: /Delete these users too/i }),
  );
  await user.click(screen.getByRole("button", { name: "Delete permanently" }));
  expect(await screen.findByText(/could not delete/i)).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  expect(mocks.remove).toHaveBeenCalledWith({
    userId: "admin",
    orphanAction: "delete",
  });
  await user.click(screen.getByRole("button", { name: "Delete permanently" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.invalidate).toHaveBeenCalledOnce();
});
it("resets orphan selection when opening another user", async () => {
  const { user, rerender } = setup();
  await user.click(
    screen.getByRole("radio", { name: /Delete these users too/i }),
  );
  mocks.query.mockReturnValue({
    data: { ...demoPreview, userId: "new" },
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  });
  rerender(
    <I18nProvider initialLocale="en">
      <DeleteUser user={demoUsers[1]!} onClose={() => {}} />
    </I18nProvider>,
  );
  expect(
    screen.getByRole("radio", { name: /Keep these users/i }),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Delete permanently" }));
  await waitFor(() =>
    expect(mocks.remove).toHaveBeenCalledWith({
      userId: "new",
      orphanAction: "keep",
    }),
  );
});
