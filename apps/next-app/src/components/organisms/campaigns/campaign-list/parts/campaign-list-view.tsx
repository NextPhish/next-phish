"use client";

import { useMemo } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { CampaignRow } from "../types/campaign-list.types";

const STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "SCHEDULED",
  "PENDING_START",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "FAILED",
];
function statusTone(status: string) {
  if (["PUBLISHED", "ACTIVE"].includes(status)) return "success" as const;
  if (status === "FAILED") return "danger" as const;
  if (["SCHEDULED", "PENDING_START", "PAUSED"].includes(status))
    return "warning" as const;
  return "neutral" as const;
}
export interface CampaignListProps {
  rows: CampaignRow[];
  total: number;
  loading: boolean;
  error?: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onRetry: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
  deleting: CampaignRow | null;
  deletePending: boolean;
  deleteError: string;
  onDeleteRequest: (row: CampaignRow) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}
export function CampaignListView(props: CampaignListProps) {
  const t = useTranslation();
  const locale = useLocale();
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const columns = useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("campaignsUi.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-[650] text-[var(--np-ink)] hover:text-[var(--np-primary)]"
            onClick={() => props.onOpen(row.original.id)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "type",
        header: t("campaignsUi.type"),
        cell: ({ row }) => (
          <Badge tone={row.original.type === "CONCRETE" ? "info" : "neutral"}>
            {t(`campaignsUi.types.${row.original.type}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: t("campaignsUi.status"),
        cell: ({ row }) => (
          <Badge tone={statusTone(row.original.status)}>
            {t(`campaignsUi.statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "tags",
        header: t("campaignsUi.tags"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex max-w-72 flex-wrap gap-[0.35rem] text-[var(--np-muted)] [&_span]:rounded-full [&_span]:bg-[var(--np-tint)] [&_span]:px-2 [&_span]:py-[0.15rem] [&_span]:text-xs [&_span]:text-[var(--np-primary)]">
            {row.original.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
            {row.original.tags.length > 3 && (
              <small>+{row.original.tags.length - 3}</small>
            )}
            {!row.original.tags.length && "—"}
          </div>
        ),
      },
      {
        id: "assets",
        header: t("campaignsUi.assets"),
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <div>
              {row.original.emailTemplate?.name ??
                t("campaignsUi.missingEmail")}
            </div>
            <small>
              {row.original.page?.name ?? t("campaignsUi.missingPage")}
            </small>
          </div>
        ),
      },
      {
        id: "audience",
        header: t("campaignsUi.audience"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.targetGroup ? (
            <div>
              <div>{row.original.targetGroup.name}</div>
              <small>
                {t("campaignsUi.recipientCount", {
                  count: row.original.targetGroup._count.users,
                })}
              </small>
            </div>
          ) : (
            <span className="text-[var(--np-muted)]">
              {t("campaignsUi.templateAudience")}
            </span>
          ),
      },
      {
        accessorKey: "updatedAt",
        header: t("campaignsUi.updated"),
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
                label: t("campaignsUi.view"),
                icon: <Eye size={16} />,
                onSelect: () => props.onOpen(row.original.id),
              },
              ...(["DRAFT", "PUBLISHED"].includes(row.original.status)
                ? [
                    {
                      label: t("campaignsUi.edit"),
                      icon: <Pencil size={16} />,
                      onSelect: () => props.onEdit(row.original.id),
                    },
                  ]
                : []),
              ...(["DRAFT", "PUBLISHED", "COMPLETED", "FAILED"].includes(
                row.original.status,
              )
                ? [
                    {
                      label: t("campaignsUi.delete"),
                      icon: <Trash2 size={16} />,
                      onSelect: () => props.onDeleteRequest(row.original),
                      destructive: true,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [date, props, t],
  );
  return (
    <section className="grid min-w-0 gap-6">
      <PageHeader
        title={t("campaignsUi.title")}
        description={t("campaignsUi.subtitle")}
        actions={
          <Button onClick={props.onCreate}>
            <Plus size={16} />
            {t("campaignsUi.new")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={props.rows}
        total={props.total}
        getRowId={(row) => row.id}
        columns={columns}
        state={props.state}
        onStateChange={props.onStateChange}
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        caption={t("campaignsUi.title")}
        labels={{ ...uiTableLabels(t), search: t("campaignsUi.search") }}
        filters={[
          {
            field: "type",
            label: t("campaignsUi.type"),
            type: "select",
            options: ["TEMPLATE", "CONCRETE"].map((value) => ({
              value,
              label: t(`campaignsUi.types.${value}`),
            })),
          },
          {
            field: "status",
            label: t("campaignsUi.status"),
            type: "select",
            options: STATUSES.map((value) => ({
              value,
              label: t(`campaignsUi.statuses.${value}`),
            })),
          },
        ]}
      />
      <Dialog
        open={Boolean(props.deleting)}
        onOpenChange={(open) =>
          !open && !props.deletePending && props.onDeleteCancel()
        }
        title={t("campaignsUi.deleteTitle")}
        description={t("campaignsUi.deleteConfirm", {
          name: props.deleting?.name ?? "",
        })}
        closeLabel={t("common.cancel")}
        dismissible={!props.deletePending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={props.onDeleteCancel}
              disabled={props.deletePending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={props.deletePending}
              onClick={props.onDeleteConfirm}
            >
              {t("campaignsUi.delete")}
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
