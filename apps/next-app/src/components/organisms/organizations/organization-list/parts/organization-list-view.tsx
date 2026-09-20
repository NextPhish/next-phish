"use client";

import { useMemo } from "react";
import { Building2, Plus, Settings2, Trash2 } from "lucide-react";
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
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import type { OrganizationListModel } from "../types/organization-list.types";

export function OrganizationListView(props: OrganizationListModel) {
  const t = useTranslation();
  const locale = useLocale();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const { onManage, onDeleteRequest, canDeleteOrganization, deletePending } =
    props;
  const columns = useMemo<ColumnDef<OrganizationView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("organizations.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className="flex items-center gap-2.5 border-0 bg-transparent p-0 text-left font-semibold text-[var(--np-ink)] hover:text-[var(--np-primary)]"
            onClick={() => onManage(row.original.id)}
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--np-tint)] text-[var(--np-primary)]">
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
          <span className="text-[var(--np-muted)]">{row.original.slug}</span>
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
              ...(canDeleteOrganization(row.original)
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
    [
      t,
      dateFormatter,
      onManage,
      onDeleteRequest,
      canDeleteOrganization,
      deletePending,
    ],
  );
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-6 [&>.np-page-header]:mb-0">
      <PageHeader
        title={t("organizations.title")}
        description={t("organizations.subtitle")}
        actions={
          props.canCreate ? (
            <Button onClick={props.onCreate}>
              <Plus size={16} aria-hidden="true" />
              {t("organizations.createTitle")}
            </Button>
          ) : undefined
        }
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
        onRowActivate={(organization) => onManage(organization.id)}
        getRowActivationLabel={(organization) =>
          `${t("organizations.manage")}: ${organization.name}`
        }
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
