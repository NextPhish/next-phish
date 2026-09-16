"use client";
import { useMemo } from "react";
import { Ban, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { UserView } from "@next-phish/backend";
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
import styles from "./users.module.css";
interface Props {
  users: UserView[];
  total: number;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onCreate: () => void;
  onDeleteRequest: (user: UserView) => void;
  toggling: UserView | null;
  onToggleRequest: (user: UserView) => void;
  onToggleCancel: () => void;
  onToggleConfirm: () => void;
  togglePending: boolean;
  toggleError?: string;
}
export function UsersPresentation(props: Props) {
  const t = useTranslation();
  const locale = useLocale();
  const date = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const { onToggleRequest, onDeleteRequest } = props;
  const columns = useMemo<ColumnDef<UserView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("usersUi.name"),
        cell: ({ row }) => (
          <strong className={styles.name}>{row.original.name}</strong>
        ),
      },
      { accessorKey: "email", header: t("usersUi.email") },
      {
        accessorKey: "role",
        header: t("usersUi.systemRole"),
        cell: ({ row }) => (
          <Badge tone={row.original.role === "admin" ? "info" : "neutral"}>
            {t(
              row.original.role === "admin"
                ? "usersUi.administrator"
                : "usersUi.member",
            )}
          </Badge>
        ),
      },
      {
        id: "organizations",
        header: t("usersUi.organizations"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.organizations.length ? (
            <div className={styles.organizations}>
              {row.original.organizations.map((org) => (
                <span key={org.id} className={styles.org}>
                  {org.name} · {org.role}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[var(--np-muted)]">
              {t("usersUi.willCreateOwn")}
            </span>
          ),
      },
      {
        id: "status",
        header: t("usersUi.status"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.disabledAt
                ? "danger"
                : row.original.passwordSetupRequired
                  ? "warning"
                  : "success"
            }
          >
            {t(
              row.original.disabledAt
                ? "usersUi.deactivated"
                : row.original.passwordSetupRequired
                  ? "usersUi.passwordPending"
                  : "usersUi.active",
            )}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("usersUi.created"),
        cell: ({ row }) => date.format(new Date(row.original.createdAt)),
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
              aria-label={`${t(row.original.disabledAt ? "usersUi.reactivate" : "usersUi.deactivate")}: ${row.original.name}`}
              onClick={() => onToggleRequest(row.original)}
            >
              {row.original.disabledAt ? (
                <RotateCcw size={16} aria-hidden="true" />
              ) : (
                <Ban size={16} aria-hidden="true" />
              )}
              {t(
                row.original.disabledAt
                  ? "usersUi.reactivate"
                  : "usersUi.deactivate",
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${t("usersUi.deletePermanently")}: ${row.original.name}`}
              onClick={() => onDeleteRequest(row.original)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [date, onDeleteRequest, onToggleRequest, t],
  );
  const disabling = Boolean(props.toggling && !props.toggling.disabledAt);
  return (
    <section className={styles.page}>
      <PageHeader
        title={t("usersUi.title")}
        description={t("usersUi.subtitle")}
        actions={
          <Button onClick={props.onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("usersUi.createUser")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={props.users}
        total={props.total}
        getRowId={(row) => row.id}
        columns={columns}
        state={props.state}
        onStateChange={props.onStateChange}
        loading={props.loading}
        error={props.error}
        onRetry={props.onRetry}
        caption={t("usersUi.title")}
        labels={{ ...uiTableLabels(t), search: t("usersUi.searchUsers") }}
        filters={[
          {
            field: "role",
            label: t("usersUi.systemRole"),
            type: "select",
            options: [
              { value: "admin", label: t("usersUi.administrator") },
              { value: "user", label: t("usersUi.member") },
            ],
          },
          {
            field: "status",
            label: t("usersUi.status"),
            type: "select",
            options: [
              { value: "active", label: t("usersUi.active") },
              { value: "pending", label: t("usersUi.passwordPending") },
              { value: "disabled", label: t("usersUi.deactivated") },
            ],
          },
        ]}
      />
      <Dialog
        open={Boolean(props.toggling)}
        onOpenChange={(open) => {
          if (!open && !props.togglePending) props.onToggleCancel();
        }}
        title={t(
          disabling ? "usersUi.deactivateTitle" : "usersUi.reactivateTitle",
        )}
        description={t(
          disabling ? "usersUi.deactivateConfirm" : "usersUi.reactivateConfirm",
          { name: props.toggling?.name ?? "" },
        )}
        closeLabel={t("common.close")}
        dismissible={!props.togglePending}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={props.togglePending}
              onClick={props.onToggleCancel}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={disabling ? "danger" : "primary"}
              loading={props.togglePending}
              onClick={props.onToggleConfirm}
            >
              {t(disabling ? "usersUi.deactivate" : "usersUi.reactivate")}
            </Button>
          </>
        }
      >
        {props.toggleError && (
          <FormMessage variant="error">{props.toggleError}</FormMessage>
        )}
      </Dialog>
    </section>
  );
}
