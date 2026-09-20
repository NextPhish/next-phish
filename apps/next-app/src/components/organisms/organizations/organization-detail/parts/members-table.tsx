"use client";
import { useMemo } from "react";
import type { MemberView } from "@next-phish/backend";
import {
  Badge,
  DataTable,
  type ColumnDef,
  type TableFilter,
} from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import type { OrganizationMembersModel } from "../types/organization-detail.types";
function memberTone(role: string) {
  if (role === "owner") return "success" as const;
  if (role === "admin") return "info" as const;
  return "neutral" as const;
}
export function OrganizationMembersTable({
  model,
}: {
  model: OrganizationMembersModel;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const columns = useMemo<ColumnDef<MemberView>[]>(
    () => [
      {
        id: "userId",
        header: t("organizations.name"),
        enableSorting: false,
        cell: ({ row }) => <strong>{row.original.user.name}</strong>,
      },
      {
        id: "id",
        header: t("common.email"),
        enableSorting: false,
        cell: ({ row }) => row.original.user.email,
      },
      {
        accessorKey: "role",
        header: t("organizations.role"),
        cell: ({ row }) => (
          <Badge tone={memberTone(row.original.role)}>
            {t(`common.${row.original.role}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("organizations.joined"),
        cell: ({ row }) =>
          dateFormatter.format(new Date(row.original.createdAt)),
      },
    ],
    [dateFormatter, t],
  );
  const filters = useMemo<TableFilter[]>(
    () => [
      {
        field: "role",
        label: t("organizations.role"),
        type: "select",
        options: ["owner", "admin", "member"].map((value) => ({
          value,
          label: t(`common.${value}`),
        })),
      },
    ],
    [t],
  );
  return (
    <DataTable
      data={model.rows}
      total={model.total}
      mode="server"
      columns={columns}
      getRowId={(row) => row.id}
      caption={t("organizationUi.membersCaption")}
      state={model.state}
      onStateChange={model.onStateChange}
      loading={model.loading}
      error={model.error}
      onRetry={model.onRetry}
      filters={filters}
      labels={{ ...uiTableLabels(t), search: t("organizations.searchMembers") }}
    />
  );
}
