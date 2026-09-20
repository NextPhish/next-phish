"use client";

import { OrganizationSettings } from "@/src/components/organisms/organization-settings";
import { useOrganizationDetail } from "./hooks/use-organization-detail";
import { OrganizationDetailSkeleton } from "./parts/detail-skeleton";
import { OrganizationDetailStatus } from "./parts/organization-detail-status";
import { OrganizationDetailView } from "./parts/organization-detail-view";

export function OrganizationDetail({
  organizationId,
}: {
  organizationId: string;
}) {
  const state = useOrganizationDetail(organizationId);
  if (state.status === "loading") return <OrganizationDetailSkeleton />;
  if (state.status !== "ready")
    return <OrganizationDetailStatus state={state} />;
  return (
    <OrganizationDetailView
      model={state.model}
      settings={
        <OrganizationSettings organization={state.model.organization} />
      }
    />
  );
}
