"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  EllipsisVertical,
  Eye,
  Pencil,
  Play,
  Trash2,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormMessage,
  useDataTableState,
  type ColumnDef,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import { trpc } from "@/src/lib/trpc";

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
function statusTone(status: ScheduleRow["status"]) {
  return status === "RUNNING"
    ? ("success" as const)
    : status === "SCHEDULED"
      ? ("info" as const)
      : status === "CANCELLED"
        ? ("danger" as const)
        : status === "DRAFT"
          ? ("warning" as const)
          : ("neutral" as const);
}
function getRowId(row: ScheduleRow) {
  return row.id;
}

export function ScheduleTable({ onChanged }: { onChanged: () => void }) {
  const router = useRouter();
  const locale = useLocale();
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

  const columns = useMemo<ColumnDef<ScheduleRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("scheduleUi.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className="font-semibold text-[var(--np-ink)] hover:text-[var(--np-primary)]"
            onClick={() => router.push(`/schedule/${row.original.id}`)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "type",
        header: t("scheduleUi.type"),
        cell: ({ row }) => (
          <Badge tone={row.original.type === "RECURRING" ? "info" : "neutral"}>
            {t(`scheduleUi.types.${row.original.type}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: t("scheduleUi.status"),
        cell: ({ row }) => (
          <Badge tone={statusTone(row.original.status)}>
            {t(`scheduleUi.statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "frequency",
        header: t("scheduleUi.cadence"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.frequency
            ? t(`scheduleUi.options.${row.original.frequency}`)
            : t("scheduleUi.oneTime"),
      },
      {
        id: "sources",
        header: t("scheduleUi.campaignSource"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="max-w-64 text-sm">
            <p className="truncate text-[var(--np-ink)]">
              {row.original.sources
                .map(({ campaign }) => campaign.name)
                .join(", ")}
            </p>
            <p className="text-xs text-[var(--np-muted)]">
              {t("scheduleUi.generatedCampaigns", {
                count: row.original._count.campaigns,
              })}
            </p>
          </div>
        ),
      },
      {
        id: "targetGroup",
        header: t("scheduleUi.audience"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.targetGroup ? (
            <div className="text-sm">
              <p>{row.original.targetGroup.name}</p>
              <p className="text-xs text-[var(--np-muted)]">
                {t("scheduleUi.recipients", {
                  count: row.original.targetGroup._count.users,
                })}
              </p>
            </div>
          ) : (
            <span className="text-[var(--np-muted)]">
              {t("scheduleUi.inherited")}
            </span>
          ),
      },
      {
        accessorKey: "startsAt",
        header: t("scheduleUi.starts"),
        cell: ({ row }) =>
          new Date(row.original.startsAt).toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: row.original.targetTimezone,
          }),
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => {
          const schedule = row.original;
          const canChange = !["COMPLETED", "CANCELLED"].includes(
            schedule.status,
          );
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${t("tableUi.actions")}: ${schedule.name}`}
                >
                  <EllipsisVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => router.push(`/schedule/${schedule.id}`)}
                >
                  <Eye size={16} />
                  {t("scheduleUi.viewDetails")}
                </DropdownMenuItem>
                {canChange && (
                  <DropdownMenuItem
                    onSelect={() =>
                      router.push(`/schedule/${schedule.id}/edit`)
                    }
                  >
                    <Pencil size={16} />
                    {t("scheduleUi.edit")}
                  </DropdownMenuItem>
                )}
                {schedule.status === "DRAFT" && (
                  <DropdownMenuItem
                    disabled={actionPending}
                    onSelect={() => activate.mutate({ id: schedule.id })}
                  >
                    <Play size={16} />
                    {t("scheduleUi.activate")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={actionPending}
                  onSelect={() => duplicate.mutate({ id: schedule.id })}
                >
                  <Copy size={16} />
                  {t("scheduleUi.duplicate")}
                </DropdownMenuItem>
                {canChange && (
                  <DropdownMenuItem
                    disabled={actionPending}
                    onSelect={() => cancel.mutate({ id: schedule.id })}
                  >
                    <X size={16} />
                    {t("scheduleUi.cancelSchedule")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-700"
                  onSelect={() =>
                    setConfirmation({ type: "delete", row: schedule })
                  }
                >
                  <Trash2 size={16} />
                  {t("scheduleUi.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [actionPending, activate, cancel, duplicate, locale, router, t],
  );

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
