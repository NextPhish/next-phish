"use client";

import { useId, useMemo, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Badge,
  DataTable,
  type ColumnDef,
  type DataTableState,
  type TableStateChange,
} from "@next-phish/ui";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/router";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

export type Recipient =
  inferRouterOutputs<AppRouter>["campaign"]["listRecipients"]["rows"][number];

function tone(status: string) {
  return status === "SENT"
    ? ("success" as const)
    : ["FAILED", "DELIVERY_UNKNOWN"].includes(status)
      ? ("danger" as const)
      : ["QUEUED", "DISPATCHING", "RETRYABLE"].includes(status)
        ? ("warning" as const)
        : ("neutral" as const);
}
function deliveryLabel(value: string, t: TranslationFunction) {
  return t(
    [
      "PLANNED",
      "QUEUED",
      "DISPATCHING",
      "RETRYABLE",
      "SENT",
      "FAILED",
      "DELIVERY_UNKNOWN",
      "CANCELLED",
    ].includes(value)
      ? `campaignsUi.deliveryStatuses.${value}`
      : "campaignsUi.unknownDelivery",
  );
}
function engagementLabel(value: string, t: TranslationFunction) {
  return t(
    `campaignsUi.engagementEvents.${["NONE", "OPENED", "CLICKED", "SUBMITTED"].includes(value) ? value : "UNKNOWN"}`,
  );
}

export function CampaignRecipientsView({
  timeZone,
  rows,
  total,
  state,
  onStateChange,
  expanded,
  onToggle,
  loading,
  error,
  onRetry,
  renderTimeline,
}: {
  timeZone: string;
  rows: Recipient[];
  total: number;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  expanded: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  renderTimeline: (recipientId: string) => ReactNode;
}) {
  const historyId = useId();
  const t = useTranslation();
  const locale = useLocale();
  const columns = useMemo<ColumnDef<Recipient>[]>(
    () => [
      {
        id: "recipient",
        header: t("campaignsUi.recipient"),
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <strong>
              {row.original.firstName} {row.original.lastName}
            </strong>
            <small className="block text-[var(--np-muted)]">
              {row.original.email}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "position",
        header: t("campaignsUi.position"),
        enableSorting: false,
      },
      {
        accessorKey: "scheduledAt",
        header: t("campaignsUi.scheduled"),
        enableSorting: false,
        cell: ({ row }) =>
          new Date(row.original.scheduledAt).toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone,
          }),
      },
      {
        accessorKey: "deliveryStatus",
        header: t("campaignsUi.delivery"),
        enableSorting: false,
        cell: ({ row }) => (
          <Badge tone={tone(row.original.deliveryStatus)}>
            {deliveryLabel(row.original.deliveryStatus, t)}
          </Badge>
        ),
      },
      {
        accessorKey: "highestNegativeEvent",
        header: t("campaignsUi.engagement"),
        enableSorting: false,
        cell: ({ row }) =>
          engagementLabel(row.original.highestNegativeEvent, t),
      },
      {
        accessorKey: "reported",
        header: t("campaignsUi.reported"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.reported ? (
            <CheckCircle2 size={17} aria-label={t("campaignsUi.reported")} />
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "attemptCount",
        header: t("campaignsUi.attempts"),
        enableSorting: false,
      },
    ],
    [locale, t, timeZone],
  );
  return (
    <section className="grid min-w-0 gap-5 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5">
      <header>
        <h2 className="text-lg font-semibold">
          {t("campaignsUi.campaignRecipients")}
        </h2>
        <p className="text-sm text-[var(--np-muted)]">
          {t("campaignsUi.recipientsDescription")}
        </p>
      </header>
      <DataTable
        mode="server"
        searchable={false}
        data={rows}
        total={total}
        getRowId={(row) => row.id}
        columns={columns}
        state={state}
        onStateChange={onStateChange}
        loading={loading}
        error={error ? t("campaignsUi.recipientsError") : undefined}
        onRetry={onRetry}
        onRowActivate={(recipient) => onToggle(recipient.id)}
        getRowActivationLabel={(recipient) =>
          t("campaignsUi.toggleHistory", { email: recipient.email })
        }
        isRowExpanded={(recipient) => expanded.includes(recipient.id)}
        renderRowDetails={(recipient) =>
          expanded.includes(recipient.id) ? (
            <article
              id={`${historyId}-${recipient.id}`}
              className="rounded-xl bg-[var(--np-tint)] p-5"
            >
              <h3 className="mb-4 font-semibold">
                {t("campaignsUi.eventHistory", {
                  name: `${recipient.firstName} ${recipient.lastName}`,
                })}
              </h3>
              {renderTimeline(recipient.id)}
            </article>
          ) : null
        }
        caption={t("campaignsUi.campaignRecipients")}
        labels={{
          ...uiTableLabels(t),
          empty: t("campaignsUi.recipientsEmpty"),
          error: t("campaignsUi.recipientsError"),
          page: (page, pages, count) =>
            t("campaignsUi.recipientsPage", { page, pages, total: count }),
          loading: t("campaignsUi.loadingRecipients"),
        }}
      />
    </section>
  );
}
