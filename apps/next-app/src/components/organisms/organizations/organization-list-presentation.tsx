"use client";

import { useMemo } from "react";
import { Building2, Settings2, Trash2 } from "lucide-react";
import type { OrganizationView } from "@next-phish/backend";
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
import styles from "./organization-list.module.css";

export interface OrganizationListProps {
  organizations: OrganizationView[];
  total: number;
  ownedCount: number;
  loading: boolean;
  error?: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onRetry: () => void;
  onManage: (id: string) => void;
  onDeleteRequest: (organization: OrganizationView) => void;
  deleting: OrganizationView | null;
  deletePending: boolean;
  deleteError?: string;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}
export function OrganizationListPresentation(props: OrganizationListProps) {
  const t = useTranslation();
  const locale = useLocale();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const { onManage, onDeleteRequest, ownedCount, deletePending } = props;
  const columns = useMemo<ColumnDef<OrganizationView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("organizations.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className={styles.name}
            onClick={() => onManage(row.original.id)}
          >
            <span className={styles.icon}>
              <Building2 size={18} aria-hidden="true" />
            </span>
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "slug",
        header: t("organizations.slug"),
        cell: ({ row }) => (
          <span className={styles.slug}>{row.original.slug}</span>
        ),
      },
      {
        id: "role",
        header: t("organizations.role"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.$me.role === "owner"
                ? "success"
                : row.original.$me.role === "admin"
                  ? "info"
                  : "neutral"
            }
          >
            {t(`common.${row.original.$me.role}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("organizations.created"),
        cell: ({ row }) =>
          dateFormatter.format(new Date(row.original.createdAt)),
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
                label: t("organizations.manage"),
                icon: <Settings2 size={16} />,
                onSelect: () => onManage(row.original.id),
              },
              ...(row.original.$me.role === "owner" && ownedCount > 1
                ? [
                    {
                      label: t("organizations.delete"),
                      icon: <Trash2 size={16} />,
                      onSelect: () => onDeleteRequest(row.original),
                      disabled: deletePending,
                      destructive: true,
                    },
                  ]
                : []),
            ]}
          />
        ),
      },
    ],
    [t, dateFormatter, onManage, onDeleteRequest, ownedCount, deletePending],
  );
  return (
    <section className={styles.page}>
      <PageHeader
        title={t("organizations.title")}
        description={t("organizations.subtitle")}
      />
      <DataTable
        mode="server"
        data={props.organizations}
        total={props.total}
        getRowId={(row) => row.id}
        columns={columns}
        state={props.state}
        onStateChange={props.onStateChange}
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        caption={t("organizations.title")}
        labels={{
          ...uiTableLabels(t),
          search: t("organizations.searchOrganizations"),
        }}
        filters={[
          {
            field: "role",
            label: t("organizations.role"),
            type: "select",
            options: ["owner", "admin", "member"].map((value) => ({
              value,
              label: t(`common.${value}`),
            })),
          },
        ]}
      />
      <Dialog
        open={Boolean(props.deleting)}
        onOpenChange={(open) => {
          if (!open && !props.deletePending) props.onDeleteCancel();
        }}
        title={t("organizations.deleteTitle")}
        description={t("organizations.deleteConfirm", {
          name: props.deleting?.name ?? "",
        })}
        closeLabel={t("common.cancel")}
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
              {t("organizations.delete")}
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
