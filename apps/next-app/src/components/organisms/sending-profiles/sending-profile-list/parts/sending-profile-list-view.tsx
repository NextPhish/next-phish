"use client";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import type { MailSendingProfileView } from "@next-phish/backend";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  FormMessage,
  PageHeader,
  type ColumnDef,
} from "@next-phish/ui";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import { EditDeleteMenu } from "@/src/components/molecules/edit-delete-menu";
import type { SendingProfileListModel } from "../types/sending-profile-list.types";

const PROVIDER_LABELS: Record<string, string> = {
  SMTP: "SMTP",
  MICROSOFT_GRAPH: "Microsoft Graph",
  AWS_SES: "AWS SES",
  SENDGRID: "SendGrid",
  MAILGUN: "Mailgun",
  POSTMARK: "Postmark",
  RESEND: "Resend",
  GENERAL_API: "General API",
};
export function SendingProfileListView({
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
}: SendingProfileListModel) {
  const columns = useMemo<ColumnDef<MailSendingProfileView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("sendingProfiles.name"),
        cell: ({ row }) => (
          <button
            type="button"
            className="border-0 bg-transparent p-0 font-[650] text-[var(--np-ink)] hover:text-[var(--np-primary)]"
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
          <EditDeleteMenu
            label={`${t("tableUi.actions")}: ${row.original.name}`}
            editLabel={t("sendingProfiles.editProfile")}
            deleteLabel={t("sendingProfiles.delete")}
            onEdit={() => onEdit(row.original.id)}
            onDelete={() => onAskDelete(row.original)}
          />
        ),
      },
    ],
    [locale, onEdit, onAskDelete, t],
  );
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
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
