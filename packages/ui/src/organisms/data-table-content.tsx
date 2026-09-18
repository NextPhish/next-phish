import { Fragment, type ReactNode } from "react";
import { flexRender, type Table, type Header } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "../atoms/button";
import { Skeleton } from "../atoms/skeleton";
import { EmptyState } from "../molecules/empty-state";
import type { DataTableLabels } from "./data-table";

function HeaderCell<T>({
  header,
  showSortPriority,
}: {
  header: Header<T, unknown>;
  showSortPriority: boolean;
}) {
  const sort = header.column.getIsSorted();
  const SortIcon =
    sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown;
  const content = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());
  return (
    <th
      scope="col"
      className={
        header.column.id === "actions" ? "np-table-actions" : undefined
      }
      colSpan={header.colSpan}
      aria-sort={
        sort && header.column.getSortIndex() === 0
          ? sort === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      {header.column.getCanSort() && !header.isPlaceholder ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className="np-sort"
        >
          {content}
          <SortIcon size={13} aria-hidden="true" />
          {sort && showSortPriority && (
            <span className="np-sort-priority" aria-hidden="true">
              {header.column.getSortIndex() + 1}
            </span>
          )}
        </button>
      ) : (
        content
      )}
    </th>
  );
}
export function TableHead<T>({ table }: { table: Table<T> }) {
  return (
    <thead>
      {table.getHeaderGroups().map((group) => (
        <tr key={group.id}>
          {group.headers.map((header) => (
            <HeaderCell
              key={header.id}
              header={header}
              showSortPriority={table.getState().sorting.length > 1}
            />
          ))}
        </tr>
      ))}
    </thead>
  );
}
interface TableBodyProps<T> {
  table: Table<T>;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  labels: DataTableLabels;
  filtered: boolean;
  onClearSearch: () => void;
  emptyAction?: ReactNode;
  renderRowDetails?: (row: T) => ReactNode;
}
export function TableBody<T>({
  table,
  loading,
  error,
  onRetry,
  labels,
  filtered,
  onClearSearch,
  emptyAction,
  renderRowDetails,
}: TableBodyProps<T>) {
  const colSpan = Math.max(1, table.getVisibleLeafColumns().length);
  if (loading)
    return (
      <tbody>
        {Array.from(
          { length: table.getState().pagination.pageSize },
          (_, row) => (
            <tr key={`loading-${row}`}>
              {table.getVisibleLeafColumns().map((column, index) => (
                <td
                  key={column.id}
                  className={
                    column.id === "actions" ? "np-table-actions" : undefined
                  }
                >
                  {row === 0 && index === 0 && (
                    <span className="np-sr-only" role="status">
                      {labels.loading}
                    </span>
                  )}
                  <Skeleton className="np-table-skeleton" />
                </td>
              ))}
            </tr>
          ),
        )}
      </tbody>
    );
  if (error)
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan}>
            <div role="alert">
              <EmptyState
                title={labels.error}
                description={error}
                action={
                  onRetry && (
                    <Button variant="secondary" onClick={onRetry}>
                      {labels.retry}
                    </Button>
                  )
                }
              />
            </div>
          </td>
        </tr>
      </tbody>
    );
  const rows = table.getRowModel().rows;
  if (!rows.length)
    return (
      <tbody>
        <tr>
          <td colSpan={colSpan}>
            <EmptyState
              title={filtered ? labels.noResults : labels.empty}
              action={
                filtered ? (
                  <Button variant="secondary" onClick={onClearSearch}>
                    {labels.clear}
                  </Button>
                ) : (
                  emptyAction
                )
              }
            />
          </td>
        </tr>
      </tbody>
    );
  return (
    <tbody>
      {rows.map((row) => {
        const details = renderRowDetails?.(row.original);
        return (
          <Fragment key={row.id}>
            <tr>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    cell.column.id === "actions"
                      ? "np-table-actions"
                      : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
            {details != null && details !== false && (
              <tr className="np-table-detail-row">
                <td colSpan={colSpan}>{details}</td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </tbody>
  );
}
