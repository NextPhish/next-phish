import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScheduleTable } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-table";

const mocks = vi.hoisted(() => ({
  queryInputs: [] as unknown[],
  push: vi.fn(),
  changed: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/i18n", () => ({
  useLocale: () => "en",
  useTranslation: () => (key: string, values?: Record<string, unknown>) =>
    key === "tableUi.actions"
      ? "Actions"
      : key === "tableUi.addFilter"
        ? "Add filter"
        : key === "tableUi.next"
          ? "Next page"
          : key === "scheduleUi.status"
            ? "Status"
            : key === "scheduleUi.duplicate"
              ? "Duplicate"
              : key === "scheduleUi.actionError"
                ? "The schedule action failed. Please try again."
                : values
                  ? `${key} ${JSON.stringify(values)}`
                  : key,
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
    filterPlaceholder: "Choose…",
    removeFilter: (label: string) => `Remove ${label} filter`,
    error: "Error",
    retry: "Retry",
    page: (page: number, pages: number, total: number) =>
      `Page ${page} of ${pages} · ${total} records`,
  }),
}));
vi.mock("@/src/lib/trpc", () => {
  const mutation = (options: { onError?: () => void }) => ({
    isPending: false,
    mutate: () => options.onError?.(),
  });
  return {
    trpc: {
      useUtils: () => ({
        campaign: { listSchedules: { invalidate: mocks.invalidate } },
      }),
      campaign: {
        listSchedules: {
          useQuery: (input: unknown) => {
            mocks.queryInputs.push(input);
            return {
              data: {
                total: 25,
                rows: [
                  {
                    id: "schedule-1",
                    name: "Awareness drill",
                    type: "ONE_TIME",
                    status: "DRAFT",
                    startsAt: new Date("2026-09-20T09:30:00Z"),
                    targetTimezone: "UTC",
                    frequency: null,
                    targetGroup: null,
                    sources: [{ campaign: { name: "Awareness" } }],
                    _count: { campaigns: 1 },
                  },
                ],
              },
              isLoading: false,
              error: null,
              refetch: vi.fn(),
            };
          },
        },
        cancelSchedule: { useMutation: mutation },
        duplicateSchedule: { useMutation: mutation },
        activateSchedule: { useMutation: mutation },
        deleteSchedule: { useMutation: mutation },
      },
    },
  };
});

describe("ScheduleTable", () => {
  beforeEach(() => {
    mocks.queryInputs.length = 0;
    mocks.changed.mockClear();
  });

  it("maps table pagination and filters to the server query", async () => {
    const user = userEvent.setup();
    render(<ScheduleTable onChanged={mocks.changed} />);

    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(screen.getByRole("menuitem", { name: "Status" }));
    expect(mocks.queryInputs.at(-1)).toMatchObject({ offset: 0, limit: 10 });
    expect(mocks.queryInputs.at(-1)).toHaveProperty("filters", undefined);

    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(
      screen.getByRole("option", { name: "scheduleUi.statuses.DRAFT" }),
    );
    expect(mocks.queryInputs.at(-1)).toMatchObject({
      offset: 0,
      limit: 10,
      filters: { status: "DRAFT" },
    });

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(mocks.queryInputs.at(-1)).toMatchObject({
      offset: 10,
      limit: 10,
      filters: { status: "DRAFT" },
    });
  });

  it("shows a localized error when a schedule mutation is rejected", async () => {
    const user = userEvent.setup();
    render(<ScheduleTable onChanged={mocks.changed} />);
    await user.click(
      screen.getByRole("button", { name: "Actions: Awareness drill" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The schedule action failed. Please try again.",
    );
  });
});
