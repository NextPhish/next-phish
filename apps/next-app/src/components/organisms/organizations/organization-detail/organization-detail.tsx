"use client";

import { useState } from "react";

import { OrganizationSettings } from "@/src/components/organisms/organization-settings";
import { useOrganizationDetail } from "./hooks/use-organization-detail";
import { OrganizationDetailSkeleton } from "./parts/detail-skeleton";
import { OrganizationDetailStatus } from "./parts/organization-detail-status";
import { OrganizationDetailView } from "./parts/organization-detail-view";
import { AddMember } from "./add-member";

export function OrganizationDetail({
  organizationId,
}: {
  organizationId: string;
}) {
  const [addingMember, setAddingMember] = useState(false);
  const state = useOrganizationDetail(organizationId);
  if (state.status === "loading") return <OrganizationDetailSkeleton />;
  if (state.status !== "ready")
    return <OrganizationDetailStatus state={state} />;
  return (
    <OrganizationDetailView
      model={state.model}
      onAddMember={() => setAddingMember(true)}
      settings={
        <OrganizationSettings organization={state.model.organization} />
      }
    >
      {addingMember ? (
        <AddMember
          organizationId={organizationId}
          onCreated={() => setAddingMember(false)}
          onCancel={() => setAddingMember(false)}
        />
      ) : null}
    </OrganizationDetailView>
  );
}
