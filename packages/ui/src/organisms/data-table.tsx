"use client";
import { useId, useMemo, type ReactNode } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { Select } from "../atoms/select";
import { FilterBar, type TableFilter } from "../molecules/filter-bar";
import { withFilterFunctions } from "./data-table-filters";
import { TableHead, TableBody } from "./data-table-content";
import type {
  DataTableState,
  TableStateChange,
} from "../hooks/use-data-table-state";
const defaultLabels = {
  search: "Search records",
  rowsPerPage: "Rows per page",
  previous: "Previous page",
  next: "Next page",
  loading: "Loading records…",
  empty: "No records yet",
  noResults: "No matching records",
  clear: "Clear search and filters",
  clearFilters: "Clear filters",
  addFilter: "Add filter",
  filterPlaceholder: "Choose…",
  removeFilter: (label: string) => `Remove ${label} filter`,
  error: "Could not load records",
  retry: "Try again",
  page: (page: number, pages: number, total: number) =>
    `Page ${page} of ${pages} · ${total} records`,
};
export type DataTableLabels = typeof defaultLabels;
interface BaseProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  caption: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  toolbar?: ReactNode;
  searchable?: boolean;
  filters?: TableFilter[];
  emptyAction?: ReactNode;
  renderRowDetails?: (row: T) => ReactNode;
  pageSizeOptions?: number[];
  labels?: Partial<DataTableLabels>;
}
export type DataTableProps<T> = BaseProps<T> &
  ({ mode?: "client"; total?: never } | { mode: "server"; total: number });
/** Server mode receives one fetched page; its rows are never filtered, sorted or paginated locally. */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  state,
  onStateChange,
  loading,
  error,
  onRetry,
  toolbar,
  searchable = true,
  filters,
  emptyAction,
  renderRowDetails,
  mode = "client",
  total,
  pageSizeOptions = [10, 25, 50, 100],
  labels: overrides,
}: DataTableProps<T>) {
  const id = useId();
  const labels = { ...defaultLabels, ...overrides };
  const filterColumns = useMemo(
    () => withFilterFunctions(columns, filters ?? []),
    [columns, filters],
  );
  const table = useReactTable({
    data,
    columns: filterColumns,
    getRowId,
    state: {
      pagination: state.pagination,
      sorting: state.sorting,
      globalFilter: state.search,
      columnFilters: Object.entries(state.filters)
        .filter(([, value]) => value !== "")
        .map(([id, value]) => ({ id, value })),
    },
    onPaginationChange: (change) =>
      onStateChange((old) => ({
        ...old,
        pagination:
          typeof change === "function" ? change(old.pagination) : change,
      })),
    onSortingChange: (change) =>
      onStateChange((old) => ({
        ...old,
        sorting: typeof change === "function" ? change(old.sorting) : change,
        pagination: { ...old.pagination, pageIndex: 0 },
      })),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: mode === "server",
    manualSorting: mode === "server",
    manualFiltering: mode === "server",
    rowCount: mode === "server" ? total : undefined,
    autoResetPageIndex: false,
    globalFilterFn: "includesString",
  });
  function search(value: string) {
    onStateChange((old) => ({
      ...old,
      search: value,
      pagination: { ...old.pagination, pageIndex: 0 },
    }));
  }
  const count =
    mode === "server" ? (total ?? 0) : table.getFilteredRowModel().rows.length;
  const pages = Math.max(1, table.getPageCount());
  return (
    <div className="np-card np-data-table" aria-busy={loading || undefined}>
      <div className="np-table-toolbar">
        {searchable && (
          <div className="np-search">
            <Search size={16} aria-hidden="true" />
            <Input
              aria-label={labels.search}
              type="search"
              value={state.search}
              onChange={(e) => search(e.target.value)}
              placeholder={labels.search}
            />
          </div>
        )}
        {toolbar}
      </div>
      {filters && (
        <FilterBar
          filters={filters}
          values={state.filters}
          addLabel={labels.addFilter}
          placeholder={labels.filterPlaceholder}
          removeLabel={labels.removeFilter}
          onRemove={(field) =>
            onStateChange((old) => {
              const filters = { ...old.filters };
              delete filters[field];
              return {
                ...old,
                filters,
                pagination: { ...old.pagination, pageIndex: 0 },
              };
            })
          }
          clearLabel={labels.clearFilters}
          onChange={(field, value) =>
            onStateChange((old) => ({
              ...old,
              filters: { ...old.filters, [field]: value },
              pagination: { ...old.pagination, pageIndex: 0 },
            }))
          }
          onClear={() =>
            onStateChange((old) => ({
              ...old,
              filters: {},
              pagination: { ...old.pagination, pageIndex: 0 },
            }))
          }
        />
      )}
      <div
        className="np-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={caption}
      >
        <table className="np-table">
          <caption className="np-sr-only">{caption}</caption>
          <TableHead table={table} />
          <TableBody
            table={table}
            loading={loading}
            error={error}
            onRetry={onRetry}
            labels={labels}
            filtered={
              Boolean(state.search) ||
              Object.values(state.filters).some((value) => value !== "")
            }
            onClearSearch={() =>
              onStateChange((old) => ({
                ...old,
                search: "",
                filters: {},
                pagination: { ...old.pagination, pageIndex: 0 },
              }))
            }
            renderRowDetails={renderRowDetails}
            emptyAction={emptyAction}
          />
        </table>
      </div>
      <div className="np-table-footer">
        <span role="status" aria-live="polite">
          {labels.page(state.pagination.pageIndex + 1, pages, count)}
        </span>
        <div className="np-pagination">
          <label htmlFor={`${id}-size`}>{labels.rowsPerPage}</label>
          <Select
            id={`${id}-size`}
            value={String(state.pagination.pageSize)}
            disabled={loading}
            onValueChange={(value) =>
              onStateChange((old) => ({
                ...old,
                pagination: { pageIndex: 0, pageSize: Number(value) },
              }))
            }
            options={[
              ...new Set([...pageSizeOptions, state.pagination.pageSize]),
            ]
              .sort((a, b) => a - b)
              .map((size) => ({ value: String(size), label: String(size) }))}
          />

          <Button
            variant="secondary"
            size="sm"
            aria-label={labels.previous}
            disabled={loading || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label={labels.next}
            disabled={loading || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
