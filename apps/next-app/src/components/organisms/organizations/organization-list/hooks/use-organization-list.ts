"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrganizationView } from "@next-phish/backend";
import { useDataTableState } from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import type { OrganizationListModel } from "../types/organization-list.types";

export function useOrganizationList(
  onCreate: () => void,
): OrganizationListModel {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(state.search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.search]);
  const [deleting, setDeleting] = useState<OrganizationView | null>(null);
  const { status, setError, reset } = useFormStatus();
  const query = trpc.organization.list.useQuery({
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: state.sorting
      .filter((s) => ["name", "slug", "createdAt"].includes(s.id))
      .map((s) => ({
        field: s.id as "name" | "slug" | "createdAt",
        order: s.desc ? "desc" : "asc",
      })),
    filters:
      typeof state.filters.role === "string" && state.filters.role
        ? { role: state.filters.role }
        : undefined,
  });
  // Count all owned organizations, independently of the current table filter/page.
  const owned = trpc.organization.list.useQuery({
    limit: 1,
    offset: 0,
    filters: { role: "owner" },
  });
  const remove = trpc.organization.delete.useMutation({
    onSuccess: async () => {
      setDeleting(null);
      reset();
      await utils.organization.list.invalidate();
      router.refresh();
    },
    onError: () => setError(t("organizationUi.deleteFailed")),
  });
  const canDeleteOrganization = useCallback(
    (organization: OrganizationView) =>
      organization.$me.role === "owner" && (owned.data?.total ?? 0) > 1,
    [owned.data?.total],
  );
  const onManage = useCallback(
    (id: string) => router.push(`/organizations/${id}`),
    [router],
  );
  const onDeleteRequest = useCallback(
    (organization: OrganizationView) => {
      if (!canDeleteOrganization(organization)) return;
      reset();
      setDeleting(organization);
    },
    [canDeleteOrganization, reset],
  );
  return {
    canCreate: (owned.data?.total ?? 0) > 0,
    onCreate,
    organizations: query.data?.organizations ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error ? t("organizationUi.listFailed") : undefined,
    state,
    onStateChange,
    onRetry: () => void query.refetch(),
    onManage,
    canDeleteOrganization,
    onDeleteRequest,
    deleting,
    deletePending: remove.isPending,
    deleteError: status.type === "error" ? status.message : undefined,
    onDeleteCancel: () => setDeleting(null),
    onDeleteConfirm: () => {
      if (deleting && canDeleteOrganization(deleting))
        remove.mutate({ organizationId: deleting.id });
    },
  };
}
