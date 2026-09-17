"use client";
import { useMemo } from "react";
import { FileCode2, Pencil, Plus, Trash2 } from "lucide-react";
import type { PageListItemView } from "@next-phish/shared";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  FormMessage,
  PageHeader,
  type ColumnDef,
  type DataTableState,
  type TableStateChange,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import styles from "./pages-list.module.css";

export interface PagesListPresentationProps {
  pages: PageListItemView[];
  total: number;
  loading: boolean;
  error?: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  deleting: PageListItemView | null;
  deletePending: boolean;
  deleteError?: string;
  onDeleteRequest: (page: PageListItemView) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}
export function PagesListPresentation(props: PagesListPresentationProps) {
  const t = useTranslation();
  const locale = useLocale();
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const { onEdit, onDeleteRequest } = props;
  const columns = useMemo<ColumnDef<PageListItemView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("pages.name"),
        cell: ({ row }) => (
          <button
            className={styles.name}
            type="button"
            onClick={() => onEdit(row.original.id)}
          >
            <span className={styles.icon}>
              <FileCode2 size={18} aria-hidden="true" />
            </span>
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "path",
        header: t("pages.path"),
        enableSorting: false,
        cell: ({ row }) => (
          <code className={styles.path}>/{row.original.path ?? "c"}</code>
        ),
      },
      {
        accessorKey: "type",
        header: t("pages.type"),
        cell: ({ row }) => (
          <Badge tone={row.original.type === "LANDING" ? "info" : "warning"}>
            {row.original.type === "LANDING"
              ? t("pages.typeLanding")
              : t("pages.typeRedirect")}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: t("pages.status"),
        cell: ({ row }) => (
          <Badge
            tone={row.original.status === "ACTIVE" ? "success" : "neutral"}
          >
            {row.original.status === "ACTIVE"
              ? t("common.active")
              : t("common.draft")}
          </Badge>
        ),
      },
      {
        id: "createdById",
        header: t("pages.createdBy"),
        enableSorting: false,
        cell: ({ row }) => row.original.createdBy.name,
      },
      {
        accessorKey: "updatedAt",
        header: t("pages.updatedAt"),
        cell: ({ row }) => formatter.format(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original.id)}
            >
              <Pencil size={16} aria-hidden="true" />
              {t("pages.openEditor")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${t("pages.delete")}: ${row.original.name}`}
              onClick={() => onDeleteRequest(row.original)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [formatter, onDeleteRequest, onEdit, t],
  );
  return (
    <section className={styles.page}>
      <PageHeader
        title={t("pages.title")}
        description={t("pages.subtitle")}
        actions={
          <Button onClick={props.onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("pages.newPage")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={props.pages}
        total={props.total}
        getRowId={(row) => row.id}
        columns={columns}
        state={props.state}
        onStateChange={props.onStateChange}
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        caption={t("pages.title")}
        labels={{ ...uiTableLabels(t), search: t("pages.searchPages") }}
        filters={[
          {
            field: "status",
            label: t("pages.status"),
            type: "select",
            options: [
              { value: "DRAFT", label: t("common.draft") },
              { value: "ACTIVE", label: t("common.active") },
            ],
          },
          {
            field: "type",
            label: t("pages.type"),
            type: "select",
            options: [
              { value: "LANDING", label: t("pages.typeLanding") },
              { value: "REDIRECT", label: t("pages.typeRedirect") },
            ],
          },
        ]}
      />
      <Dialog
        open={Boolean(props.deleting)}
        onOpenChange={(open) => {
          if (!open && !props.deletePending) props.onDeleteCancel();
        }}
        title={t("pages.deleteTitle")}
        description={t("pages.deleteConfirm", {
          name: props.deleting?.name ?? "",
        })}
        dismissible={!props.deletePending}
        closeLabel={t("common.cancel")}
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
              {t("pages.delete")}
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
