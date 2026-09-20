import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupAddUser } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-add-user";
const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  invalidate: vi.fn(),
  close: vi.fn(),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ targetGroup: { invalidate: mocks.invalidate } }),
    targetGroup: {
      addUser: { useMutation: () => ({ mutateAsync: mocks.add }) },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.add.mockResolvedValue({});
});
it("validates and awaits an exact add-user payload before closing", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupAddUser visible targetGroupId="g1" onHide={mocks.close} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Create" }));
  expect(mocks.add).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Email *"), "alex@example.com");
  await user.type(screen.getByLabelText("First name *"), "Alex");
  await user.type(screen.getByLabelText("Last name *"), "Morgan");
  await user.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() =>
    expect(mocks.add).toHaveBeenCalledWith({
      targetGroupId: "g1",
      email: "alex@example.com",
      firstName: "Alex",
      lastName: "Morgan",
      position: undefined,
    }),
  );
  expect(mocks.invalidate).toHaveBeenCalled();
  expect(mocks.close).toHaveBeenCalled();
});
