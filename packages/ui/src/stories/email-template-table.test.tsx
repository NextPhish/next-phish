import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailTemplateList } from "../../../../apps/next-app/src/components/organisms/email-templates/email-template-list";

const mocks = vi.hoisted(() => ({
  inputs: [] as unknown[],
  deletePayloads: [] as unknown[],
  push: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
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
      `Page ${page} of ${pages} · ${total} records`,
  }),
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      emailTemplate: { list: { invalidate: mocks.invalidate } },
    }),
    emailTemplate: {
      list: {
        useQuery: (input: unknown) => {
          mocks.inputs.push(input);
          return {
            data: {
              total: 25,
              emailTemplates: [
                {
                  id: "template-1",
                  name: "Awareness",
                  status: "DRAFT",
                  tags: ["training"],
                  createdBy: { name: "Alex" },
                  updatedAt: new Date("2026-09-10"),
                },
              ],
            },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
          };
        },
      },
      delete: {
        useMutation: (options: { onSuccess: () => void }) => ({
          isPending: false,
          mutate: (payload: unknown) => {
            mocks.deletePayloads.push(payload);
            void options.onSuccess();
          },
        }),
      },
    },
  },
}));

describe("EmailTemplateList", () => {
  beforeEach(() => {
    mocks.inputs.length = 0;
    mocks.deletePayloads.length = 0;
    mocks.push.mockClear();
  });
  it("maps search, status and pagination to the server query", async () => {
    const user = userEvent.setup();
    render(<EmailTemplateList />);
    await user.type(screen.getByRole("searchbox"), "invoice");
    await waitFor(() =>
      expect(mocks.inputs.at(-1)).toMatchObject({
        search: "invoice",
        limit: 10,
        offset: 0,
      }),
    );
    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(
      screen.getByRole("menuitem", { name: "emailTemplates.status" }),
    );
    await user.click(
      screen.getByRole("combobox", { name: "emailTemplates.status" }),
    );
    await user.click(screen.getByText("common.active"));
    await waitFor(() =>
      expect(mocks.inputs.at(-1)).toMatchObject({
        filters: { status: "ACTIVE" },
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "emailTemplates.name" }),
    );
    expect(mocks.inputs.at(-1)).toMatchObject({
      sort: [{ field: "name", order: "asc" }],
    });
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(mocks.inputs.at(-1)).toMatchObject({ offset: 10, limit: 10 });
  });
  it("sends the selected id to the delete mutation", async () => {
    const user = userEvent.setup();
    render(<EmailTemplateList />);
    await user.click(screen.getByRole("button", { name: /tableUi.actions/ }));
    await user.click(screen.getByText("emailTemplates.delete"));
    await user.click(screen.getAllByText("emailTemplates.delete").at(-1)!);
    expect(mocks.deletePayloads).toEqual([{ id: "template-1" }]);
  });
});
