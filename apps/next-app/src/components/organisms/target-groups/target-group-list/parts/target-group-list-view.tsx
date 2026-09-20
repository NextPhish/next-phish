"use client";
import { useMemo } from "react";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import type { TargetGroupListItemView } from "@next-phish/shared";
import {
  Badge,
  Button,
  DataTable,
  RowActionsMenu,
  Dialog,
  FormMessage,
  PageHeader,
  type ColumnDef,
  type DataTableState,
  type TableStateChange,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
export interface TargetGroupListViewProps {
  groups: TargetGroupListItemView[];
  total: number;
  loading: boolean;
  error?: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  deleting: TargetGroupListItemView | null;
  deletePending: boolean;
  deleteError?: string;
  onDeleteRequest: (group: TargetGroupListItemView) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}
export function TargetGroupListView(props: TargetGroupListViewProps) {
  const t = useTranslation();
  const locale = useLocale();
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const { onEdit, onDeleteRequest } = props;
  const columns = useMemo<ColumnDef<TargetGroupListItemView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("targetGroups.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-left font-[650] text-[var(--np-ink)] hover:text-[var(--np-primary)]"
            onClick={() => onEdit(row.original.id)}
          >
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--np-tint)] text-[var(--np-primary)]">
              <Users size={18} aria-hidden="true" />
            </span>
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: t("targetGroups.status"),
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.status === "ACTIVE"
                ? "success"
                : row.original.status === "ARCHIVED"
                  ? "warning"
                  : "neutral"
            }
          >
            {row.original.status === "ACTIVE"
              ? t("targetGroups.active")
              : row.original.status === "ARCHIVED"
                ? t("targetGroups.archived")
                : t("common.draft")}
          </Badge>
        ),
      },
      {
        accessorKey: "userCount",
        header: t("targetGroups.userCount"),
        enableSorting: false,
        cell: ({ row }) => row.original.userCount.toLocaleString(locale),
      },
      {
        id: "createdById",
        header: t("targetGroups.createdBy"),
        enableSorting: false,
        cell: ({ row }) => row.original.createdBy.name,
      },
      {
        accessorKey: "updatedAt",
        header: t("targetGroups.updatedAt"),
        cell: ({ row }) => date.format(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionsMenu
            label={`${t("tableUi.actions")}: ${row.original.name}`}
            items={[
              {
                label: t("targetGroups.editGroup"),
                icon: <Pencil size={16} />,
                onSelect: () => onEdit(row.original.id),
              },
              {
                label: t("targetGroups.delete"),
                icon: <Trash2 size={16} />,
                onSelect: () => onDeleteRequest(row.original),
                destructive: true,
              },
            ]}
          />
        ),
      },
    ],
    [date, locale, onDeleteRequest, onEdit, t],
  );
  return (
    <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 text-[var(--np-ink)] [&>.np-page-header]:mb-0">
      <PageHeader
        title={t("targetGroups.title")}
        description={t("targetGroups.subtitle")}
        actions={
          <Button onClick={props.onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("targetGroups.newGroup")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={props.groups}
        total={props.total}
        getRowId={(row) => row.id}
        columns={columns}
        state={props.state}
        onStateChange={props.onStateChange}
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        caption={t("targetGroups.title")}
        labels={{ ...uiTableLabels(t), search: t("targetGroups.searchGroups") }}
        filters={[
          {
            field: "status",
            label: t("targetGroups.status"),
            type: "select",
            options: [
              { value: "DRAFT", label: t("common.draft") },
              { value: "ACTIVE", label: t("targetGroups.active") },
              { value: "ARCHIVED", label: t("targetGroups.archived") },
            ],
          },
        ]}
      />
      <Dialog
        open={Boolean(props.deleting)}
        onOpenChange={(open) => {
          if (!open && !props.deletePending) props.onDeleteCancel();
        }}
        title={t("targetGroups.deleteTitle")}
        description={t("targetGroups.deleteConfirm", {
          name: props.deleting?.name ?? "",
        })}
        closeLabel={t("common.close")}
        dismissible={!props.deletePending}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={props.deletePending}
              onClick={props.onDeleteCancel}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={props.deletePending}
              onClick={props.onDeleteConfirm}
            >
              {t("targetGroups.delete")}
            </Button>
          </>
        }
      >
        {props.deleteError && (
          <FormMessage variant="error">{props.deleteError}</FormMessage>
        )}
      </Dialog>
    </section>
  );
}
