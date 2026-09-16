"use client";
import { useMemo } from "react";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { EmailTemplateListItemView } from "@next-phish/shared";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormMessage,
  PageHeader,
  type ColumnDef,
  type DataTableState,
  type TableStateChange,
} from "@next-phish/ui";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import styles from "./email-templates.module.css";

interface Props {
  t: TranslationFunction;
  locale: string;
  rows: EmailTemplateListItemView[];
  total: number;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  deleteTarget: EmailTemplateListItemView | null;
  deleting: boolean;
  deleteError: string;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onAskDelete: (template: EmailTemplateListItemView) => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

export function EmailTemplatesPresentation({
  t,
  locale,
  rows,
  total,
  state,
  onStateChange,
  loading,
  error,
  onRetry,
  deleteTarget,
  deleting,
  deleteError,
  onCreate,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: Props) {
  const columns = useMemo<ColumnDef<EmailTemplateListItemView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("emailTemplates.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className={styles.nameLink}
            onClick={() => onEdit(row.original.id)}
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: t("emailTemplates.status"),
        cell: ({ row }) => (
          <Badge
            tone={row.original.status === "ACTIVE" ? "success" : "warning"}
          >
            {row.original.status === "ACTIVE"
              ? t("common.active")
              : t("common.draft")}
          </Badge>
        ),
      },
      {
        id: "tags",
        header: t("emailTemplates.tags"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.tags.length ? (
            <div className={styles.tags}>
              {row.original.tags.map((tag) => (
                <Badge key={tag} tone="info">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span className={styles.muted}>—</span>
          ),
      },
      {
        id: "createdBy",
        header: t("emailTemplates.createdBy"),
        enableSorting: false,
        cell: ({ row }) => row.original.createdBy.name,
      },
      {
        accessorKey: "updatedAt",
        header: t("emailTemplates.updatedAt"),
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString(locale, {
            dateStyle: "medium",
          }),
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`${t("tableUi.actions")}: ${row.original.name}`}
              >
                <EllipsisVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(row.original.id)}>
                <Pencil size={16} />
                {t("emailTemplates.openEditor")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAskDelete(row.original)}>
                <Trash2 size={16} />
                {t("emailTemplates.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [locale, onEdit, onAskDelete, t],
  );
  const labels = {
    ...uiTableLabels(t),
    search: t("emailTemplates.searchTemplates"),
  };
  return (
    <div className={styles.overview}>
      <PageHeader
        title={t("emailTemplates.title")}
        description={t("emailTemplates.subtitle")}
        actions={
          <Button onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("emailTemplates.newTemplate")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={rows}
        total={total}
        columns={columns}
        getRowId={(row) => row.id}
        caption={t("emailTemplates.title")}
        state={state}
        onStateChange={onStateChange}
        loading={loading}
        error={error}
        onRetry={onRetry}
        filters={[
          {
            field: "status",
            label: t("emailTemplates.status"),
            type: "select",
            options: [
              { value: "DRAFT", label: t("common.draft") },
              { value: "ACTIVE", label: t("common.active") },
            ],
          },
        ]}
        labels={labels}
        emptyAction={
          <Button onClick={onCreate}>{t("emailTemplates.newTemplate")}</Button>
        }
      />
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) onCancelDelete();
        }}
        dismissible={!deleting}
        title={t("emailTemplates.deleteTitle")}
        description={
          deleteTarget
            ? t("emailTemplates.deleteConfirm", { name: deleteTarget.name })
            : ""
        }
        footer={
          <>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={onCancelDelete}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={deleting} onClick={onDelete}>
              {t("emailTemplates.delete")}
            </Button>
          </>
        }
        closeLabel={t("common.cancel")}
      >
        {deleteError && (
          <FormMessage variant="error">{deleteError}</FormMessage>
        )}
      </Dialog>
    </div>
  );
}
