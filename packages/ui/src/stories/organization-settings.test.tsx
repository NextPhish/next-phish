import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { GeneralSettings } from "../../../../apps/next-app/src/components/organisms/organization-settings/general-settings/general-settings";
import { IgnoredNetworks } from "../../../../apps/next-app/src/components/organisms/organization-settings/ignored-networks/ignored-networks";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  invalidateOrganization: vi.fn().mockResolvedValue(undefined),
  invalidateOrganizations: vi.fn().mockResolvedValue(undefined),
  invalidateNetworks: vi.fn().mockResolvedValue(undefined),
  refetchNetworks: vi.fn().mockResolvedValue(undefined),
  queryInputs: [] as unknown[],
}));

vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      organization: {
        getById: { invalidate: mocks.invalidateOrganization },
        list: { invalidate: mocks.invalidateOrganizations },
        listIgnoredNetworks: { invalidate: mocks.invalidateNetworks },
      },
    }),
    organization: {
      update: { useMutation: () => ({ mutateAsync: mocks.update }) },
      listIgnoredNetworks: {
        useQuery: (input: unknown) => {
          mocks.queryInputs.push(input);
          return {
            data: [
              {
                id: "network-1",
                network: "10.0.0.0/8",
                normalizedNetwork: "10.0.0.0/8",
                description: "Office",
                createdAt: new Date("2026-09-01T00:00:00Z"),
              },
            ],
            isLoading: false,
            error: null,
            refetch: mocks.refetchNetworks,
          };
        },
      },
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

beforeEach(() => {
  vi.clearAllMocks();
  mocks.queryInputs.length = 0;
  mocks.update.mockResolvedValue({});
  mocks.create.mockResolvedValue({});
  mocks.remove.mockResolvedValue({});
});

it("wires organization edits to the update mutation and invalidates both views", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <GeneralSettings
        organization={
          {
            id: "organization-1",
            name: "Acme",
            slug: "acme",
          } as never
        }
      />
    </I18nProvider>,
  );

  await user.clear(screen.getByLabelText(/^Organization name/));
  await user.type(screen.getByLabelText(/^Organization name/), "Acme Security");
  await user.click(screen.getByRole("button", { name: "Save changes" }));

  await waitFor(() =>
    expect(mocks.update).toHaveBeenCalledWith({
      organizationId: "organization-1",
      name: "Acme Security",
      slug: "acme",
    }),
  );
  expect(mocks.invalidateOrganization).toHaveBeenCalledWith({
    organizationId: "organization-1",
  });
  expect(mocks.invalidateOrganizations).toHaveBeenCalled();
});

it("adds a network through the real mutation adapter", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <IgnoredNetworks organizationId="organization-1" />
    </I18nProvider>,
  );

  await user.type(
    screen.getByLabelText(/^IP address or CIDR network/),
    "192.0.2.10",
  );
  await user.type(screen.getByLabelText("Description (optional)"), "Trusted");
  await user.click(screen.getByRole("button", { name: "Add network" }));

  expect(mocks.queryInputs).toContainEqual({
    organizationId: "organization-1",
  });

  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
  expect(mocks.create).toHaveBeenCalledWith({
    organizationId: "organization-1",
    network: "192.0.2.10",
    description: "Trusted",
  });
  expect(mocks.invalidateNetworks).toHaveBeenCalledWith({
    organizationId: "organization-1",
  });
});

it("closes removal confirmation without invoking the mutation", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <IgnoredNetworks organizationId="organization-1" />
    </I18nProvider>,
  );

  await user.click(screen.getByRole("button", { name: "Remove" }));
  const dialog = await screen.findByRole("dialog");
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  expect(mocks.remove).not.toHaveBeenCalled();
});

it("requires confirmation before wiring a network removal", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <IgnoredNetworks organizationId="organization-1" />
    </I18nProvider>,
  );

  await user.click(screen.getByRole("button", { name: "Remove" }));
  const dialog = await screen.findByRole("dialog");
  await user.click(
    dialog.querySelector("button.np-button--danger") as HTMLButtonElement,
  );

  await waitFor(() =>
    expect(mocks.remove).toHaveBeenCalledWith({
      organizationId: "organization-1",
      id: "network-1",
    }),
  );
  expect(mocks.invalidateNetworks).toHaveBeenCalled();
});

it("shows Bulgarian validation instead of the shared schema's English text", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="bg">
      <GeneralSettings
        organization={{ id: "organization-1", name: "", slug: "" } as never}
      />
    </I18nProvider>,
  );

  await user.click(screen.getByRole("button", { name: "Запази промените" }));
  expect(
    await screen.findByText("Името на организацията е задължително"),
  ).toBeVisible();
  expect(
    screen.queryByText("Organization name is required"),
  ).not.toBeInTheDocument();
});
