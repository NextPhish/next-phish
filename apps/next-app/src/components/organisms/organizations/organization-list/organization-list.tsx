"use client";

import { useState } from "react";
import { CreateOrganization } from "../../app-shell/create-organization";
import { useOrganizationList } from "./hooks/use-organization-list";
import { OrganizationListView } from "./parts/organization-list-view";

export function OrganizationList() {
  const [creating, setCreating] = useState(false);
  const model = useOrganizationList(() => setCreating(true));
  return (
    <>
      <OrganizationListView {...model} />
      {creating && model.canCreate && (
        <CreateOrganization visible onHide={() => setCreating(false)} />
      )}
    </>
  );
}
