"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { useDataTableState } from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n/client";
import { CampaignListPresentation } from "./list-presentation";

export type CampaignRow = {
  id: string;
  name: string;
  tags: string[];
  type: "TEMPLATE" | "CONCRETE";
  status: string;
  targetTimezone: string;
  updatedAt: Date;
  emailTemplate: { name: string } | null;
  page: { name: string } | null;
  targetGroup: { name: string; _count: { users: number } } | null;
};

export function CampaignListContainer() {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState(state.search);
  const [deleting, setDeleting] = useReducer(
    (_: CampaignRow | null, next: CampaignRow | null) => next,
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(state.search), 300);
    return () => clearTimeout(timer);
  }, [state.search]);
  const allowedSorts = new Set([
    "name",
    "type",
    "status",
    "createdAt",
    "updatedAt",
  ]);
  const sort = state.sorting.flatMap(({ id, desc }) =>
    allowedSorts.has(id)
      ? [
          {
            field: id as "name" | "type" | "status" | "createdAt" | "updatedAt",
            order: desc ? ("desc" as const) : ("asc" as const),
          },
        ]
      : [],
  );
  const filters = Object.fromEntries(
    Object.entries(state.filters)
      .filter(([, value]) => typeof value === "string" && value)
      .map(([key, value]) => [key, String(value)]),
  );
  const query = trpc.campaign.list.useQuery({
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: sort.length ? sort : undefined,
    filters: Object.keys(filters).length ? filters : undefined,
  });
  const remove = trpc.campaign.delete.useMutation({
    onSuccess: async () => {
      setDeleting(null);
      setDeleteError("");
      await utils.campaign.list.invalidate();
    },
    onError: () => setDeleteError(t("campaignsUi.deleteError")),
  });
  return (
    <CampaignListPresentation
      rows={(query.data?.rows ?? []) as CampaignRow[]}
      total={query.data?.total ?? 0}
      loading={query.isLoading}
      error={query.error ? t("campaignsUi.loadError") : undefined}
      state={state}
      onStateChange={onStateChange}
      onRetry={() => void query.refetch()}
      onOpen={(id) => router.push(`/campaigns/${id}`)}
      onEdit={(id) => router.push(`/campaigns/${id}/edit`)}
      onCreate={() => router.push("/campaigns/new")}
      deleting={deleting}
      deletePending={remove.isPending}
      deleteError={deleteError}
      onDeleteRequest={setDeleting}
      onDeleteCancel={() => {
        setDeleting(null);
        setDeleteError("");
      }}
      onDeleteConfirm={() => deleting && remove.mutate({ id: deleting.id })}
    />
  );
}
