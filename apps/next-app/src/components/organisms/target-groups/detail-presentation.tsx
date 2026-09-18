"use client";
import { useMemo, type ReactNode } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import type { TargetGroupUserView, TargetGroupView } from "@next-phish/shared";
import {
  Button,
  DataTable,
  RowActionsMenu,
  Dialog,
  FormMessage,
  PageHeader,
  Skeleton,
  type ColumnDef,
  type DataTableState,
  type TableStateChange,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import styles from "./target-groups.module.css";
interface Props {
  group: TargetGroupView | null;
  groupLoading: boolean;
  groupId: string;
  users: TargetGroupUserView[];
  total: number;
  usersLoading: boolean;
  usersError?: string;
  onRetryUsers: () => void;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onAdd: () => void;
  onImport: () => void;
  removing: TargetGroupUserView | null;
  removePending: boolean;
  removeError?: string;
  onRemoveRequest: (user: TargetGroupUserView) => void;
  onRemoveCancel: () => void;
  onRemoveConfirm: () => void;
  form: ReactNode;
}
export function TargetGroupDetailPresentation(props: Props) {
  const t = useTranslation();
  const { onRemoveRequest } = props;
  const columns = useMemo<ColumnDef<TargetGroupUserView>[]>(
    () => [
      {
        accessorKey: "email",
        header: t("targetGroups.email"),
        enableSorting: false,
      },
      {
        accessorKey: "firstName",
        header: t("targetGroups.firstName"),
        enableSorting: false,
      },
      {
        accessorKey: "lastName",
        header: t("targetGroups.lastName"),
        enableSorting: false,
      },
      {
        accessorKey: "position",
        header: t("targetGroups.position"),
        enableSorting: false,
        cell: ({ row }) => row.original.position ?? "—",
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionsMenu
            label={`${t("tableUi.actions")}: ${row.original.email}`}
            items={[
              {
                label: t("targetGroups.removeUser"),
                icon: <Trash2 size={16} />,
                onSelect: () => onRemoveRequest(row.original),
                destructive: true,
              },
            ]}
          />
        ),
      },
    ],
    [onRemoveRequest, t],
  );
  if (props.groupLoading)
    return (
      <div
        role="status"
        aria-label={t("targetGroups.editGroup")}
        className={styles.page}
      >
        <Skeleton style={{ height: "3rem", width: "35%" }} />
        <Skeleton style={{ height: "14rem" }} />
        <Skeleton style={{ height: "26rem" }} />
      </div>
    );
  if (!props.group)
    return (
      <p className="text-[var(--np-muted)]">{t("targetGroups.notFound")}</p>
    );
  return (
    <section className={styles.page}>
      <PageHeader
        title={t("targetGroups.editGroup")}
        description={t("targetGroups.editSubtitle")}
      />
      <section className={`np-card ${styles.card}`}>{props.form}</section>
      <section className={styles.page}>
        <div className={styles.heading}>
          <h2>
            {t("targetGroups.users")} ({props.total})
          </h2>
          <div className={styles.buttons}>
            <Button variant="secondary" onClick={props.onAdd}>
              <Plus size={16} aria-hidden="true" />
              {t("targetGroups.addUser")}
            </Button>
            <Button variant="secondary" onClick={props.onImport}>
              <Upload size={16} aria-hidden="true" />
              {t("targetGroups.importUsers")}
            </Button>
          </div>
        </div>
        <DataTable
          mode="server"
          data={props.users}
          total={props.total}
          getRowId={(row) => row.id}
          columns={columns}
          state={props.state}
          onStateChange={props.onStateChange}
          loading={props.usersLoading}
          error={props.usersError}
          onRetry={props.onRetryUsers}
          caption={t("targetGroups.users")}
          labels={{
            ...uiTableLabels(t),
            search: t("targetGroups.searchUsers"),
          }}
        />
      </section>
      <Dialog
        open={Boolean(props.removing)}
        onOpenChange={(open) => {
          if (!open && !props.removePending) props.onRemoveCancel();
        }}
        title={t("targetGroups.removeUser")}
        description={t("targetGroups.removeUserConfirm", {
          name: `${props.removing?.firstName ?? ""} ${props.removing?.lastName ?? ""}`.trim(),
        })}
        closeLabel={t("common.close")}
        dismissible={!props.removePending}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={props.removePending}
              onClick={props.onRemoveCancel}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={props.removePending}
              onClick={props.onRemoveConfirm}
            >
              {t("targetGroups.removeUser")}
            </Button>
          </>
        }
      >
        {props.removeError && (
          <FormMessage variant="error">{props.removeError}</FormMessage>
        )}
      </Dialog>
    </section>
  );
}
