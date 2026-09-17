"use client";
import { useReducer } from "react";
import type {
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
export interface DataTableState {
  pagination: PaginationState;
  sorting: SortingState;
  search: string;
  filters: Record<string, string | number>;
}
export type TableStateChange = Updater<DataTableState>;
export function useDataTableState(initial?: Partial<DataTableState>) {
  const [state, onStateChange] = useReducer(
    (state: DataTableState, change: TableStateChange) =>
      typeof change === "function" ? change(state) : change,
    {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [],
      search: "",
      filters: {},
      ...initial,
    },
  );
  return { state, onStateChange };
}
