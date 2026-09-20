"use client";
import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  DataTable,
  RowActionsMenu,
  useDataTableState,
  type ColumnDef,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "../../../../../lib/i18n";
import { uiTableLabels } from "../../../../../lib/ui-table-labels";
import type { ApiKeyView } from "../types/api-key.types";

function getRowId(row: ApiKeyView) {
  return row.id;
}
export function ApiKeyListView({
  keys,
  loading,
  error,
  onRetry,
  onCreate,
  onRevoke,
}: {
  keys: ApiKeyView[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onCreate: () => void;
  onRevoke: (key: ApiKeyView) => void;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const { state, onStateChange } = useDataTableState();
  const columns = useMemo<ColumnDef<ApiKeyView>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("apiKeys.name"),
        cell: ({ row }) => <strong>{row.original.name || "—"}</strong>,
      },
      {
        accessorKey: "start",
        header: t("apiKeys.keyPrefix"),
        cell: ({ getValue }) => <code>{String(getValue() ?? "—")}</code>,
      },
      {
        id: "status",
        header: t("apiKeys.status"),
        accessorFn: (row) =>
          row.expiresAt && new Date(row.expiresAt) < new Date()
            ? "expired"
            : row.enabled
              ? "active"
              : "disabled",
        cell: ({ getValue }) => (
          <Badge tone={getValue() === "active" ? "success" : "neutral"}>
            {t(
              getValue() === "expired"
                ? "apiKeys.expired"
                : `common.${getValue()}`,
            )}
          </Badge>
        ),
      },
      {
        id: "usage",
        header: t("apiKeys.usage"),
        accessorFn: (row) =>
          !row.rateLimitEnabled
            ? "—"
            : row.rateLimitMax
              ? `${row.requestCount} / ${row.rateLimitMax}`
              : String(row.requestCount),
      },
      ...(["createdAt", "expiresAt"] as const).map((field) => ({
        accessorKey: field,
        header: t(
          field === "createdAt" ? "apiKeys.created" : "apiKeys.expires",
        ),
        cell: ({ row }: { row: { original: ApiKeyView } }) =>
          row.original[field]
            ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                new Date(row.original[field]!),
              )
            : "—",
      })),
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionsMenu
            label={`${t("tableUi.actions")}: ${row.original.name ?? row.original.start ?? row.original.id}`}
            items={[
              {
                label: t("apiKeys.revoke"),
                icon: <Trash2 size={16} />,
                onSelect: () => onRevoke(row.original),
                destructive: true,
              },
            ]}
          />
        ),
      },
    ],
    [locale, onRevoke, t],
  );
  return (
    <Card>
      <CardHeader
        title={t("apiKeys.title")}
        description={t("apiKeys.subtitle")}
        action={
          <Button onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            {t("apiKeys.create")}
          </Button>
        }
      />
      <CardBody className="pt-0">
        <DataTable
          caption={t("apiKeys.title")}
          data={keys}
          columns={columns}
          getRowId={getRowId}
          state={state}
          onStateChange={onStateChange}
          loading={loading}
          error={error}
          onRetry={onRetry}
          labels={{ ...uiTableLabels(t), empty: t("apiKeys.noKeys") }}
          filters={[
            {
              field: "status",
              label: t("apiKeys.status"),
              type: "select",
              options: [
                { label: t("common.active"), value: "active" },
                { label: t("common.disabled"), value: "disabled" },
                { label: t("apiKeys.expired"), value: "expired" },
              ],
            },
          ]}
        />
      </CardBody>
    </Card>
  );
}
