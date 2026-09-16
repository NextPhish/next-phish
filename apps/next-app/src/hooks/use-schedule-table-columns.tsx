"use client";

import { useMemo } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type ColumnDef,
} from "@next-phish/ui";
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
                    onSelect={() => onActivate(schedule.id)}
                  >
                    <Play size={16} />
                    {t("scheduleUi.activate")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={actionPending}
                  onSelect={() => onDuplicate(schedule.id)}
                >
                  <Copy size={16} />
                  {t("scheduleUi.duplicate")}
                </DropdownMenuItem>
                {canChange && (
                  <DropdownMenuItem
                    disabled={actionPending}
                    onSelect={() => onCancel(schedule.id)}
                  >
                    <X size={16} />
                    {t("scheduleUi.cancelSchedule")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-700"
                  onSelect={() => onDelete(schedule)}
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
