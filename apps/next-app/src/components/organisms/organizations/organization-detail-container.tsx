"use client";
import { useEffect, useState } from "react";
import {
  Button,
  EmptyState,
  FormMessage,
  useDataTableState,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { OrganizationSettings } from "@/src/components/organisms/organization-settings";
import { OrganizationDetailPresentation } from "./organization-detail-presentation";
import { OrganizationDetailSkeleton } from "./organization-detail-skeleton";
export function OrganizationDetailContainer({
  organizationId,
}: {
  organizationId: string;
}) {
  const t = useTranslation();
  const { state, onStateChange } = useDataTableState();
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
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
  if (organization.isLoading) return <OrganizationDetailSkeleton />;
  if (organization.error)
    return (
      <FormMessage
        variant="error"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void organization.refetch()}
          >
            {t("tableUi.retry")}
          </Button>
        }
      >
        {t("organizationUi.loadError")}
      </FormMessage>
    );
  if (!organization.data)
    return (
      <EmptyState
        title={t("organizations.notFound")}
        description={t("organizationUi.notFoundDescription")}
      />
    );
  return (
    <OrganizationDetailPresentation
      model={{
        organization: organization.data,
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
        },
      }}
      settings={<OrganizationSettings organization={organization.data} />}
    />
  );
}
