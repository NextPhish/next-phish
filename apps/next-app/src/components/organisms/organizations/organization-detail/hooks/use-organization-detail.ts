"use client";

import { useEffect, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import type { OrganizationDetailState } from "../types/organization-detail.types";

export function useOrganizationDetail(
  organizationId: string,
): OrganizationDetailState {
  const t = useTranslation();
  const { state, onStateChange } = useDataTableState();
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const [resendingUserId, setResendingUserId] = useState<string>();
  const [resendError, setResendError] = useState<string | null>(null);
  const resendWelcome = trpc.organization.resendMemberWelcome.useMutation();
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(state.search), 300);
    return () => clearTimeout(timeout);
  }, [state.search]);
  const sort = state.sorting.flatMap(({ id, desc }) =>
    ["role", "createdAt"].includes(id)
      ? [
          {
            field: id as "role" | "createdAt",
            order: desc ? ("desc" as const) : ("asc" as const),
          },
        ]
      : [],
  );
  const role =
    typeof state.filters.role === "string" && state.filters.role
      ? state.filters.role
      : undefined;
  const organization = trpc.organization.getById.useQuery({ organizationId });
  const analytics = trpc.organization.analytics.useQuery({ organizationId });
  const members = trpc.organization.listMembers.useQuery({
    organizationId,
    search: debouncedSearch || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: sort.length ? sort : undefined,
    filters: role ? { role } : undefined,
  });

  if (organization.isLoading) return { status: "loading" };
  if (organization.error)
    return {
      status: "error",
      onRetry: () => void organization.refetch(),
    };
  if (!organization.data) return { status: "not-found" };
  const canManage = organization.data.$me.role !== "member";

  return {
    status: "ready",
    model: {
      organization: organization.data,
      canManage,
      analytics: analytics.data?.months ?? [],
      analyticsLoading: analytics.isLoading,
      analyticsError: analytics.error
        ? t("organizationUi.analyticsError")
        : null,
      onRetryAnalytics: () => void analytics.refetch(),
      members: {
        rows: members.data?.members ?? [],
        total: members.data?.total ?? 0,
        state,
        onStateChange,
        loading: members.isLoading,
        error: members.error ? t("organizationUi.membersError") : null,
        onRetry: () => void members.refetch(),
        canManage,
        resendingUserId,
        resendError,
        onResendWelcome: async (userId) => {
          setResendError(null);
          setResendingUserId(userId);
          try {
            await resendWelcome.mutateAsync({ organizationId, userId });
          } catch {
            setResendError(t("organizations.resendWelcomeError"));
          } finally {
            setResendingUserId(undefined);
          }
        },
      },
    },
  };
}
