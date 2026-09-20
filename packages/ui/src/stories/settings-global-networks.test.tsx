import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { GlobalIgnoredNetworks } from "../../../../apps/next-app/src/components/organisms/settings/global-ignored-networks/global-ignored-networks";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn(),
  query: vi.fn(),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      settings: { listIgnoredNetworks: { invalidate: mocks.invalidate } },
    }),
    settings: {
      listIgnoredNetworks: { useQuery: mocks.query },
      createIgnoredNetwork: {
        useMutation: () => ({ mutateAsync: mocks.create }),
      },
      deleteIgnoredNetwork: {
        useMutation: () => ({
          mutateAsync: mocks.remove,
          isPending: false,
          variables: undefined,
        }),
      },
    },
  },
}));
const rows = [
  {
    id: "global-1",
    network: "10.0.0.0/8",
    normalizedNetwork: "10.0.0.0/8",
    description: "Gateway",
    createdAt: new Date("2026-09-10T00:00:00Z"),
  },
];
beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.remove.mockResolvedValue({});
  mocks.query.mockReturnValue({
    data: rows,
    isLoading: false,
    error: null,
    refetch: mocks.refetch,
  });
});
function setup() {
  return render(
    <I18nProvider initialLocale="en">
      <GlobalIgnoredNetworks />
    </I18nProvider>,
  );
}

it("creates a global ignored network without an organizationId and invalidates the global list", async () => {
  const user = userEvent.setup();
  setup();
  await user.type(
    screen.getByLabelText(/^IP address or CIDR network/),
    "192.0.2.10",
  );
  await user.type(screen.getByLabelText("Description (optional)"), "Scanner");
  await user.click(screen.getByRole("button", { name: "Add network" }));
  await waitFor(() =>
    expect(mocks.create).toHaveBeenCalledWith({
      network: "192.0.2.10",
      description: "Scanner",
    }),
  );
  expect(mocks.query).toHaveBeenCalledWith();
  expect(mocks.invalidate).toHaveBeenCalledWith();
});

it("keeps the confirmation open with the error after a failed global delete", async () => {
  mocks.remove.mockRejectedValue(new Error("Deletion failed"));
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole("button", { name: "Remove" }));
  const dialog = await screen.findByRole("dialog");
  expect(mocks.remove).not.toHaveBeenCalled();
  await user.click(within(dialog).getByRole("button", { name: "Remove" }));
  await waitFor(() =>
    expect(mocks.remove).toHaveBeenCalledWith({ id: "global-1" }),
  );
  expect(mocks.invalidate).not.toHaveBeenCalled();
  expect(dialog).toBeInTheDocument();
  expect(
    within(dialog).getByText("Failed to remove the global ignored network."),
  ).toBeVisible();
});

it("invalidates the global list and closes confirmation after a successful delete", async () => {
  const user = userEvent.setup();
  setup();
  await user.click(screen.getByRole("button", { name: "Remove" }));
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: "Remove" }));
  await waitFor(() =>
    expect(mocks.remove).toHaveBeenCalledWith({ id: "global-1" }),
  );
  expect(mocks.invalidate).toHaveBeenCalledWith();
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
});

it("uses the localized shared schema errors for an empty network", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="bg">
      <GlobalIgnoredNetworks />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Добави мрежа" }));
  expect(
    await screen.findByText("IP адресът или мрежата е задължителен"),
  ).toBeVisible();
  expect(mocks.create).not.toHaveBeenCalled();
});
