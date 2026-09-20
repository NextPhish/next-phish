"use client";

import { useOrganizationList } from "./hooks/use-organization-list";
import { OrganizationListView } from "./parts/organization-list-view";

export function OrganizationList() {
  const model = useOrganizationList();
  return <OrganizationListView {...model} />;
}
