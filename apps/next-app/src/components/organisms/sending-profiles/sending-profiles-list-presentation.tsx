"use client";
import { useMemo } from "react";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { MailSendingProfileView } from "@next-phish/backend";
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
import styles from "./sending-profiles-list.module.css";

export const PROVIDER_LABELS: Record<string, string> = {
  SMTP: "SMTP",
  MICROSOFT_GRAPH: "Microsoft Graph",
  AWS_SES: "AWS SES",
  SENDGRID: "SendGrid",
  MAILGUN: "Mailgun",
  POSTMARK: "Postmark",
  RESEND: "Resend",
  GENERAL_API: "General API",
};
interface Props {
  t: TranslationFunction;
  locale: string;
  rows: MailSendingProfileView[];
  total: number;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  target: MailSendingProfileView | null;
  deleting: boolean;
  deleteError: string;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onAskDelete: (profile: MailSendingProfileView) => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}
export function SendingProfilesListPresentation({
  t,
  locale,
  rows,
  total,
  state,
  onStateChange,
  loading,
  error,
  onRetry,
  target,
  deleting,
  deleteError,
  onCreate,
  onEdit,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: Props) {
  const columns = useMemo<ColumnDef<MailSendingProfileView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("sendingProfiles.name"),
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
        accessorKey: "providerType",
        header: t("sendingProfiles.providerType"),
        cell: ({ row }) =>
          PROVIDER_LABELS[row.original.providerType] ??
          row.original.providerType,
      },
      {
        id: "fromEmail",
        header: t("common.email"),
        enableSorting: false,
        cell: ({ row }) => (
          <span>
            {row.original.fromName} &lt;{row.original.fromEmail}&gt;
          </span>
        ),
      },
      {
        id: "isDefault",
        header: t("sendingProfiles.isDefault"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge tone="success">{t("sendingProfiles.defaultBadge")}</Badge>
          ) : null,
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
                {t("sendingProfiles.editProfile")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onAskDelete(row.original)}>
                <Trash2 size={16} />
                {t("sendingProfiles.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [locale, onEdit, onAskDelete, t],
  );
  return (
    <div className={styles.page}>
      <PageHeader
        title={t("sendingProfiles.title")}
        description={t("sendingProfiles.subtitle")}
        actions={
          <Button onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("sendingProfiles.newProfile")}
          </Button>
        }
      />
      <DataTable
        mode="server"
        data={rows}
        total={total}
        columns={columns}
        getRowId={(row) => row.id}
        caption={t("sendingProfiles.title")}
        state={state}
        onStateChange={onStateChange}
        loading={loading}
        error={error}
        onRetry={onRetry}
        labels={{
          ...uiTableLabels(t),
          search: t("sendingProfiles.searchProfiles"),
        }}
        filters={[
          {
            field: "providerType",
            label: t("sendingProfiles.providerType"),
            type: "select",
            options: Object.entries(PROVIDER_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          },
        ]}
        emptyAction={
          <Button onClick={onCreate}>{t("sendingProfiles.newProfile")}</Button>
        }
      />
      <Dialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) onCancelDelete();
        }}
        dismissible={!deleting}
        title={t("sendingProfiles.deleteTitle")}
        description={
          target
            ? t("sendingProfiles.deleteConfirm", { name: target.name })
            : ""
        }
        closeLabel={t("common.cancel")}
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
              {t("sendingProfiles.delete")}
            </Button>
          </>
        }
      >
        {deleteError && (
          <FormMessage variant="error">{deleteError}</FormMessage>
        )}
      </Dialog>
    </div>
  );
}
