"use client";
import type { ReactNode } from "react";
import { PageHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { OrganizationAnalytics } from "./organization-analytics";
import { OrganizationMembersTable } from "./members-table";
import type { OrganizationDetailModel } from "./organization-detail.types";
import styles from "./organization-detail.module.css";
export function OrganizationDetailPresentation({
  model,
  settings,
}: {
  model: OrganizationDetailModel;
  settings?: ReactNode;
}) {
  const t = useTranslation();
  const canManage = model.organization.$me.role !== "member";
  return (
    <div className={styles.page}>
      <PageHeader
        title={model.organization.name}
        description={t("organizations.detailSubtitle")}
      />
      {canManage && settings ? (
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
        <h2 id="organization-members-title">{t("organizations.members")}</h2>
        <OrganizationMembersTable model={model.members} />
      </section>
    </div>
  );
}
