import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupForm } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-form";
const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      targetGroup: { list: { invalidate: vi.fn() }, invalidate: vi.fn() },
    }),
    targetGroup: {
      create: { useMutation: () => ({ mutateAsync: mocks.create }) },
      update: { useMutation: () => ({ mutateAsync: mocks.update }) },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.update.mockResolvedValue({});
});
it("creates with a validated user payload and displays localized field issues", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupForm />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Add user" }));
  await user.click(screen.getByRole("button", { name: "Create" }));
  expect(mocks.create).not.toHaveBeenCalled();
  expect(
    await screen.findByText("First name is required."),
  ).toBeInTheDocument();
  await user.type(screen.getByLabelText("Group name"), "  Engineering  ");
  await user.type(screen.getByLabelText("Email *"), "alex@example.com");
  await user.type(screen.getByLabelText("First name *"), "Alex");
  await user.type(screen.getByLabelText("Last name *"), "Morgan");
  await user.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() =>
    expect(mocks.create).toHaveBeenCalledWith({
      name: "Engineering",
      status: "DRAFT",
      users: [
        {
          email: "alex@example.com",
          firstName: "Alex",
          lastName: "Morgan",
          position: undefined,
        },
      ],
    }),
  );
  expect(mocks.push).toHaveBeenCalledWith("/target-groups");
});
it("keeps update failure visible without navigating", async () => {
  mocks.update.mockRejectedValue(new Error("server internal"));
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupForm
        mode="edit"
        groupId="g1"
        initialName="Engineering"
        initialStatus="ACTIVE"
      />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(mocks.update).toHaveBeenCalledWith({
      id: "g1",
      name: "Engineering",
      status: "ACTIVE",
    }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Failed to update target group",
  );
  expect(mocks.push).not.toHaveBeenCalled();
});
