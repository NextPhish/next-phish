"use client";

import { Button, EmptyState, FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { OrganizationDetailState } from "../types/organization-detail.types";

export function OrganizationDetailStatus({
  state,
}: {
  state: Extract<OrganizationDetailState, { status: "error" | "not-found" }>;
}) {
  const t = useTranslation();
  if (state.status === "not-found")
    return (
      <EmptyState
        title={t("organizations.notFound")}
        description={t("organizationUi.notFoundDescription")}
      />
    );
  return (
    <FormMessage
      variant="error"
      action={
        <Button variant="secondary" size="sm" onClick={state.onRetry}>
          {t("tableUi.retry")}
        </Button>
      }
    >
      {t("organizationUi.loadError")}
    </FormMessage>
  );
}
