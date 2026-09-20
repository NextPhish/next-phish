"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PageListItemView } from "@next-phish/shared";
import { useDataTableState } from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";

export function usePagesList() {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<PageListItemView | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { status, setError, reset } = useFormStatus();
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(state.search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.search]);
  const query = trpc.page.list.useQuery({
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: state.sorting
      .filter((item) =>
        ["name", "type", "status", "updatedAt"].includes(item.id),
      )
      .map((item) => ({
        field: item.id as "name" | "type" | "status" | "updatedAt",
        order: item.desc ? ("desc" as const) : ("asc" as const),
      })),
    filters:
      state.filters.status || state.filters.type
        ? {
            status:
              state.filters.status === "DRAFT" ||
              state.filters.status === "ACTIVE"
                ? state.filters.status
                : undefined,
            type:
              state.filters.type === "LANDING" ||
              state.filters.type === "REDIRECT"
                ? state.filters.type
                : undefined,
          }
        : undefined,
  });
  const remove = trpc.page.delete.useMutation({
    onSuccess: async () => {
      setDeleting(null);
      reset();
      await utils.page.list.invalidate();
    },
    onError: () => setError(t("pages.deleteError")),
  });
  return {
    pages: query.data?.pages ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error ? t("pages.listLoadError") : undefined,
    state,
    onStateChange,
    onRetry: () => void query.refetch(),
    onCreate: () => router.push("/pages/new"),
    onEdit: (id: string) => router.push(`/pages/${id}`),
    deleting,
    deletePending: remove.isPending,
    deleteError: status.type === "error" ? status.message : undefined,
    onDeleteRequest: (page: PageListItemView) => {
      reset();
      setDeleting(page);
    },
    onDeleteCancel: () => setDeleting(null),
    onDeleteConfirm: () => deleting && remove.mutate({ id: deleting.id }),
  };
}
