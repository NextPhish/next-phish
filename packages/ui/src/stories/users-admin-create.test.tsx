import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CreateUser } from "../../../../apps/next-app/src/components/organisms/users/create-user";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ user: { list: { invalidate: mocks.invalidate } } }),
    user: {
      create: { useMutation: () => ({ mutateAsync: mocks.create }) },
      listOrganizations: {
        useQuery: () => ({
          data: [{ id: "acme", name: "Acme" }],
          isLoading: false,
        }),
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.invalidate.mockResolvedValue(undefined);
});
function setup(onCreated = vi.fn()) {
  render(
    <I18nProvider initialLocale="en">
      <CreateUser visible onCreated={onCreated} onCancel={() => {}} />
    </I18nProvider>,
  );
  return { user: userEvent.setup(), onCreated };
}
it("validates the exact shared schema and submits an existing organization assignment", async () => {
  const { user, onCreated } = setup();
  await user.click(screen.getByRole("button", { name: /Create and send/i }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(mocks.create).not.toHaveBeenCalled();
  await user.type(
    screen.getByRole("textbox", { name: /Name/i }),
    "Mira Ivanova",
  );
  await user.type(
    screen.getByRole("textbox", { name: /Email/i }),
    "mira@example.com",
  );
  await user.click(
    screen.getByRole("radio", { name: /Assign.*organization/i }),
  );
  await user.click(screen.getByRole("combobox", { name: /Organizations/i }));
  await user.click(screen.getByRole("option", { name: "Acme" }));
  await user.click(screen.getByRole("button", { name: /Create and send/i }));
  await waitFor(() =>
    expect(mocks.create).toHaveBeenCalledWith({
      name: "Mira Ivanova",
      email: "mira@example.com",
      role: "user",
      organizationMode: "existing",
      organizationId: "acme",
    }),
  );
  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
});
it("shows a failed mutation in the open dialog without reporting creation", async () => {
  mocks.create.mockRejectedValue(new Error("private server detail"));
  const { user, onCreated } = setup();
  await user.type(screen.getByRole("textbox", { name: /Name/i }), "Alex");
  await user.type(
    screen.getByRole("textbox", { name: /Email/i }),
    "alex@example.com",
  );
  await user.click(screen.getByRole("button", { name: /Create and send/i }));
  expect(await screen.findByText(/could not create/i)).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(onCreated).not.toHaveBeenCalled();
  expect(mocks.invalidate).not.toHaveBeenCalled();
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({
      organizationMode: "self",
      organizationId: undefined,
    }),
  );
});
