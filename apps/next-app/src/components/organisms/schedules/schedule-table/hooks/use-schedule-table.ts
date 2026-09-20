"use client";
import { useEffect, useReducer, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { trpc } from "@/src/lib/trpc";
import { useScheduleTableColumns } from "./use-schedule-table-columns";
import type { ScheduleRow } from "../types/schedule-table.types";
type Confirmation = { type: "closed" } | { type: "delete"; row: ScheduleRow };
export function useScheduleTable(onChanged: () => void) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const [confirmation, setConfirmation] = useReducer(
    (_: Confirmation, next: Confirmation) => next,
    { type: "closed" },
  );
  const [mutationError, setMutationError] = useReducer(
    (_: string, next: string) => next,
    "",
  );
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(state.search), 300);
    return () => clearTimeout(timeout);
  }, [state.search]);
  const allowedSorts = new Set(["name", "type", "status", "startsAt"]);
  const sort = state.sorting.flatMap(({ id, desc }) =>
    allowedSorts.has(id)
      ? [
          {
            field: id as "name" | "type" | "status" | "startsAt",
            order: desc ? ("desc" as const) : ("asc" as const),
          },
        ]
      : [],
  );
  const queryFilters = Object.fromEntries(
    Object.entries(state.filters)
      .filter(([, value]) => typeof value === "string" && value !== "")
      .map(([field, value]) => [field, String(value)]),
  );
  const query = trpc.campaign.listSchedules.useQuery({
    search: debouncedSearch || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: sort.length ? sort : undefined,
    filters: Object.keys(queryFilters).length ? queryFilters : undefined,
  });
  async function refresh() {
    setMutationError("");
    await utils.campaign.listSchedules.invalidate();
    onChanged();
  }
  const mutationFailed = () => setMutationError(t("scheduleUi.actionError"));
  const cancel = trpc.campaign.cancelSchedule.useMutation({
    onSuccess: refresh,
    onError: mutationFailed,
  });
  const duplicate = trpc.campaign.duplicateSchedule.useMutation({
    onSuccess: refresh,
    onError: mutationFailed,
  });
  const activate = trpc.campaign.activateSchedule.useMutation({
    onSuccess: refresh,
    onError: mutationFailed,
  });
  const remove = trpc.campaign.deleteSchedule.useMutation({
    onSuccess: async () => {
      setConfirmation({ type: "closed" });
      await refresh();
    },
    onError: mutationFailed,
  });
  const columns = useScheduleTableColumns({
    actionPending:
      cancel.isPending || duplicate.isPending || activate.isPending,
    onActivate: (id) => activate.mutate({ id }),
    onDuplicate: (id) => duplicate.mutate({ id }),
    onCancel: (id) => cancel.mutate({ id }),
    onDelete: (row) => setConfirmation({ type: "delete", row }),
  });
  return {
    t,
    state,
    onStateChange,
    columns,
    rows: (query.data?.rows ?? []) as ScheduleRow[],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    loadError: Boolean(query.error),
    onRetry: () => void query.refetch(),
    mutationError,
    deleteOpen: confirmation.type === "delete",
    deletePending: remove.isPending,
    onDeleteOpenChange: (open: boolean) => {
      if (!open && !remove.isPending) setConfirmation({ type: "closed" });
    },
    onCancelDelete: () => setConfirmation({ type: "closed" }),
    onConfirmDelete: () => {
      if (confirmation.type === "delete")
        remove.mutate({ id: confirmation.row.id });
    },
  };
}
export type ScheduleTableModel = ReturnType<typeof useScheduleTable>;
