import type { ColumnDef } from "@tanstack/react-table";
import type { TableFilter } from "../molecules/filter-bar";
export function withFilterFunctions<T>(
  columns: ColumnDef<T>[],
  filters: TableFilter[],
): ColumnDef<T>[] {
  return columns.map((column) => {
    if ("columns" in column && column.columns)
      return {
        ...column,
        columns: withFilterFunctions(column.columns, filters),
      };
    const id =
      column.id ?? ("accessorKey" in column ? String(column.accessorKey) : "");
    const filter = filters.find((item) => item.field === id);
    if (!filter || column.filterFn) return column;
    return {
      ...column,
      filterFn:
        filter.type === "text"
          ? "includesString"
          : filter.type === "numeric"
            ? "equals"
            : "equalsString",
    };
  });
}
