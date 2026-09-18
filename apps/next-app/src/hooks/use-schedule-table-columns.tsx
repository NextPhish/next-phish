"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, Pencil, Play, Trash2, X } from "lucide-react";
import { Badge, RowActionsMenu, type ColumnDef } from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n";
import type { ScheduleRow } from "@/src/components/organisms/schedules/schedule-table";

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
export function useScheduleTableColumns({
  actionPending,
  onActivate,
  onDuplicate,
  onCancel,
  onDelete,
}: {
  actionPending: boolean;
  onActivate: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (row: ScheduleRow) => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslation();
  return useMemo<ColumnDef<ScheduleRow>[]>(
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
            <RowActionsMenu
              label={`${t("tableUi.actions")}: ${schedule.name}`}
              items={[
                {
                  label: t("scheduleUi.viewDetails"),
                  icon: <Eye size={16} />,
                  onSelect: () => router.push(`/schedule/${schedule.id}`),
                },
                ...(canChange
                  ? [
                      {
                        label: t("scheduleUi.edit"),
                        icon: <Pencil size={16} />,
                        onSelect: () =>
                          router.push(`/schedule/${schedule.id}/edit`),
                      },
                    ]
                  : []),
                ...(schedule.status === "DRAFT"
                  ? [
                      {
                        label: t("scheduleUi.activate"),
                        icon: <Play size={16} />,
                        onSelect: () => onActivate(schedule.id),
                        disabled: actionPending,
                      },
                    ]
                  : []),
                {
                  label: t("scheduleUi.duplicate"),
                  icon: <Copy size={16} />,
                  onSelect: () => onDuplicate(schedule.id),
                  disabled: actionPending,
                },
                ...(canChange
                  ? [
                      {
                        label: t("scheduleUi.cancelSchedule"),
                        icon: <X size={16} />,
                        onSelect: () => onCancel(schedule.id),
                        disabled: actionPending,
                      },
                    ]
                  : []),
                {
                  label: t("scheduleUi.delete"),
                  icon: <Trash2 size={16} />,
                  onSelect: () => onDelete(schedule),
                  destructive: true,
                },
              ]}
            />
          );
        },
      },
    ],
    [
      actionPending,
      locale,
      onActivate,
      onCancel,
      onDelete,
      onDuplicate,
      router,
      t,
    ],
  );
}
