"use client";
import type { ReactNode } from "react";
import { Button, PageHeader } from "@next-phish/ui";
import { UserPlus } from "lucide-react";
import { useTranslation } from "@/src/lib/i18n/client";
import { OrganizationAnalytics } from "./analytics";
import { OrganizationMembersTable } from "./members-table";
import type { OrganizationDetailModel } from "../types/organization-detail.types";
export function OrganizationDetailView({
  model,
  settings,
  onAddMember,
  children,
}: {
  model: OrganizationDetailModel;
  settings?: ReactNode;
  onAddMember: () => void;
  children?: ReactNode;
}) {
  const t = useTranslation();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 text-[var(--np-ink)] [&>.np-page-header]:mb-0 [&>section]:grid [&>section]:grid-cols-[minmax(0,1fr)] [&>section]:gap-4 [&>section>h2]:text-[1.05rem] [&>section>h2]:font-bold">
      <PageHeader
        title={model.organization.name}
        description={t("organizations.detailSubtitle")}
      />
      {model.canManage && settings ? (
        <section aria-labelledby="organization-settings-title">
          <h2 id="organization-settings-title">
            {t("organizations.settingsTitle")}
          </h2>
          {settings}
        </section>
      ) : null}
      <section aria-labelledby="organization-analytics-title">
        <h2 id="organization-analytics-title">
          {t("organizationUi.analyticsTitle")}
        </h2>
        <OrganizationAnalytics
          months={model.analytics}
          loading={model.analyticsLoading}
          error={model.analyticsError}
          onRetry={model.onRetryAnalytics}
        />
      </section>
      <section aria-labelledby="organization-members-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="organization-members-title">{t("organizations.members")}</h2>
          {model.canManage ? (
            <Button size="sm" onClick={onAddMember}>
              <UserPlus size={16} aria-hidden="true" />
              {t("organizations.addMember")}
            </Button>
          ) : null}
        </div>
        <OrganizationMembersTable model={model.members} />
      </section>
      {children}
    </div>
  );
}
