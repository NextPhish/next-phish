"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TargetGroupListItemView } from "@next-phish/shared";
import { useDataTableState } from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { TargetGroupsListPresentation } from "./list-presentation";

export function TargetGroupsListContainer() {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<TargetGroupListItemView | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, setError, reset } = useFormStatus();
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(state.search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.search]);
  const query = trpc.targetGroup.list.useQuery({
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: state.sorting
      .filter((item) =>
        ["name", "status", "createdAt", "updatedAt"].includes(item.id),
      )
      .map((item) => ({
        field: item.id as "name" | "status" | "createdAt" | "updatedAt",
        order: item.desc ? ("desc" as const) : ("asc" as const),
      })),
    filters:
      state.filters.status === "DRAFT" ||
      state.filters.status === "ACTIVE" ||
      state.filters.status === "ARCHIVED"
        ? { status: state.filters.status }
        : undefined,
  });
  const remove = trpc.targetGroup.delete.useMutation({
    onSuccess: async () => {
      setDeleting(null);
      reset();
      await utils.targetGroup.list.invalidate();
    },
    onError: () => setError(t("targetGroups.deleteError")),
  });
  return (
    <TargetGroupsListPresentation
      groups={query.data?.targetGroups ?? []}
      total={query.data?.total ?? 0}
      loading={query.isLoading}
      error={query.error ? t("targetGroups.listError") : undefined}
      state={state}
      onStateChange={onStateChange}
      onRetry={() => void query.refetch()}
      onCreate={() => router.push("/target-groups/new")}
      onEdit={(id) => router.push(`/target-groups/${id}`)}
      deleting={deleting}
      deletePending={remove.isPending}
      deleteError={status.type === "error" ? status.message : undefined}
      onDeleteRequest={(group) => {
        reset();
        setDeleting(group);
      }}
      onDeleteCancel={() => setDeleting(null)}
      onDeleteConfirm={() => {
        if (deleting) remove.mutate({ id: deleting.id });
      }}
    />
  );
}
