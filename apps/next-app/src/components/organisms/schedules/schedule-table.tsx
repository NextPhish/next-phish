"use client";

import { useEffect, useReducer, useState } from "react";
import {
  Button,
  DataTable,
  Dialog,
  FormMessage,
  useDataTableState,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import { trpc } from "@/src/lib/trpc";
import { useScheduleTableColumns } from "@/src/hooks/use-schedule-table-columns";

export type ScheduleRow = {
  id: string;
  name: string;
  type: "ONE_TIME" | "RECURRING";
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  startsAt: Date;
  targetTimezone: string;
  frequency: string | null;
  targetGroup: { name: string; _count: { users: number } } | null;
  sources: Array<{ campaign: { name: string } }>;
  _count: { campaigns: number };
};

type Confirmation = { type: "closed" } | { type: "delete"; row: ScheduleRow };
const statuses = [
  "DRAFT",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "CANCELLED",
] as const;
const types = ["ONE_TIME", "RECURRING"] as const;
function getRowId(row: ScheduleRow) {
  return row.id;
}

export function ScheduleTable({ onChanged }: { onChanged: () => void }) {
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
  const queryInput = {
    search: debouncedSearch || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: sort.length ? sort : undefined,
    filters: Object.keys(queryFilters).length ? queryFilters : undefined,
  };
  const { data, isLoading, error, refetch } =
    trpc.campaign.listSchedules.useQuery(queryInput);
  const rows = (data?.rows ?? []) as ScheduleRow[];
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
  const actionPending =
    cancel.isPending || duplicate.isPending || activate.isPending;

  const columns = useScheduleTableColumns({
    actionPending,
    onActivate: (id) => activate.mutate({ id }),
    onDuplicate: (id) => duplicate.mutate({ id }),
    onCancel: (id) => cancel.mutate({ id }),
    onDelete: (row) => setConfirmation({ type: "delete", row }),
  });

  return (
    <section aria-labelledby="schedule-table-heading">
      <div className="mb-4">
        <h2
          id="schedule-table-heading"
          className="text-lg font-semibold text-[var(--np-ink)]"
        >
          {t("scheduleUi.title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--np-muted)]">
          {t("scheduleUi.subtitle")}
        </p>
      </div>
      <DataTable
        mode="server"
        data={rows}
        total={data?.total ?? 0}
        columns={columns}
        getRowId={getRowId}
        caption={t("scheduleUi.title")}
        state={state}
        onStateChange={onStateChange}
        loading={isLoading}
        error={error ? t("scheduleUi.loadError") : undefined}
        onRetry={() => void refetch()}
        labels={{ ...uiTableLabels(t), search: t("scheduleUi.search") }}
        filters={[
          {
            field: "type",
            label: t("scheduleUi.type"),
            type: "select",
            options: types.map((value) => ({
              label: t(`scheduleUi.types.${value}`),
              value,
            })),
          },
          {
            field: "status",
            label: t("scheduleUi.status"),
            type: "select",
            options: statuses.map((value) => ({
              label: t(`scheduleUi.statuses.${value}`),
              value,
            })),
          },
        ]}
      />
      {mutationError && (
        <div className="mt-3">
          <FormMessage variant="error">{mutationError}</FormMessage>
        </div>
      )}
      <Dialog
        open={confirmation.type === "delete"}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setConfirmation({ type: "closed" });
        }}
        title={t("scheduleUi.deleteTitle")}
        description={t("scheduleUi.deleteDescription")}
        closeLabel={t("common.cancel")}
        dismissible={!remove.isPending}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={remove.isPending}
              onClick={() => setConfirmation({ type: "closed" })}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => {
                if (confirmation.type === "delete")
                  remove.mutate({ id: confirmation.row.id });
              }}
            >
              {t("scheduleUi.delete")}
            </Button>
          </>
        }
      >
        {null}
      </Dialog>
    </section>
  );
}
