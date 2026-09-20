import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SendingProfileList } from "../../../../apps/next-app/src/components/organisms/sending-profiles";

const mocks = vi.hoisted(() => ({
  inputs: [] as unknown[],
  deleted: [] as unknown[],
  invalidate: vi.fn().mockResolvedValue(undefined),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/i18n", () => ({
  useLocale: () => "en",
  useTranslation: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}));
vi.mock("@/src/lib/ui-table-labels", () => ({
  uiTableLabels: () => ({
    search: "Search",
    rowsPerPage: "Rows per page",
    previous: "Previous page",
    next: "Next page",
    loading: "Loading",
    empty: "Empty",
    noResults: "No results",
    clear: "Clear",
    clearFilters: "Clear filters",
    addFilter: "Add filter",
    filterPlaceholder: "Choose",
    removeFilter: (label: string) => `Remove ${label}`,
    error: "Error",
    retry: "Retry",
    page: (page: number, pages: number, total: number) =>
      `Page ${page} of ${pages} · ${total}`,
  }),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      mailSending: { list: { invalidate: mocks.invalidate } },
    }),
    mailSending: {
      list: {
        useQuery: (input: unknown) => {
          mocks.inputs.push(input);
          return {
            data: {
              profiles: [
                {
                  id: "profile-1",
                  name: "SMTP delivery",
                  providerType: "SMTP",
                  fromName: "Security",
                  fromEmail: "security@example.com",
                  isDefault: true,
                  updatedAt: new Date("2026-09-12"),
                },
              ],
              total: 25,
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
          };
        },
      },
      delete: {
        useMutation: () => ({
          isPending: false,
          mutateAsync: (payload: unknown) => {
            mocks.deleted.push(payload);
            return Promise.resolve();
          },
        }),
      },
    },
  },
}));

describe("sending profiles list", () => {
  it("maps search, provider filter, sorting and pagination to the query", async () => {
    const user = userEvent.setup();
    render(<SendingProfileList />);
    await user.type(screen.getByRole("searchbox"), "smtp");
    await waitFor(() =>
      expect(mocks.inputs.at(-1)).toMatchObject({
        search: "smtp",
        limit: 10,
        offset: 0,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(
      screen.getByRole("menuitem", { name: "sendingProfiles.providerType" }),
    );
    await user.click(
      screen.getByRole("combobox", { name: "sendingProfiles.providerType" }),
    );
    await user.click(screen.getAllByText("SMTP").at(-1)!);
    expect(mocks.inputs.at(-1)).toMatchObject({
      filters: { providerType: "SMTP" },
    });
    await user.click(
      screen.getByRole("button", { name: "sendingProfiles.name" }),
    );
    expect(mocks.inputs.at(-1)).toMatchObject({
      sort: [{ field: "name", order: "asc" }],
    });
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(mocks.inputs.at(-1)).toMatchObject({ offset: 10 });
  });
  it("deletes only the confirmed profile", async () => {
    const user = userEvent.setup();
    render(<SendingProfileList />);
    await user.click(screen.getByRole("button", { name: /tableUi.actions/ }));
    await user.click(screen.getByText("sendingProfiles.delete"));
    await user.click(screen.getAllByText("sendingProfiles.delete").at(-1)!);
    await waitFor(() =>
      expect(mocks.deleted).toContainEqual({ id: "profile-1" }),
    );
  });
});
