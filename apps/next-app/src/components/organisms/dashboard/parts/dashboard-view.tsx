"use client";

import type { ElementType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Flag,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { ButtonLink, EmptyState, PageHeader } from "@next-phish/ui";
import type { OrganizationDashboardView } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";
import { AttentionPanel } from "./attention-panel";
import { EngagementFunnel } from "./engagement-funnel";
import { DashboardMetricCard } from "./metric-card";
import { SetupChecklist } from "./setup-checklist";
import { DashboardSkeleton } from "./dashboard-skeleton";

interface DashboardViewProps {
  organizationName?: string;
  data?: OrganizationDashboardView;
  isLoading: boolean;
  error?: string;
  timeline?: ReactNode;
  linkComponent?: ElementType;
}

export function DashboardView({
  organizationName,
  data,
  isLoading,
  error,
  timeline,
  linkComponent,
}: DashboardViewProps) {
  const t = useTranslation();

  if (isLoading) return <DashboardSkeleton label={t("common.loading")} />;

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-6 py-10">
        <EmptyState
          icon={<AlertTriangle size={24} />}
          title={t("dashboard.loadError")}
          description={error}
        />
      </div>
    );
  }

  const isGettingStarted = data.readiness.campaigns === 0;

  return (
    <div>
      {organizationName && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-ui-primary">
          {organizationName}
        </p>
      )}
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.subtitle")}
        actions={
          <>
            <span className="np-button np-button--md np-button--secondary cursor-default">
              <CalendarDays size={16} aria-hidden="true" />
              {t("dashboard.lastThirtyDays")}
            </span>
            <ButtonLink variant="primary" href="/campaigns/new">
              <Plus size={16} aria-hidden="true" />
              {t("dashboard.createCampaign")}
            </ButtonLink>
          </>
        }
      />

      {isGettingStarted ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <SetupChecklist
            readiness={data.readiness}
            linkComponent={linkComponent}
          />
          <AttentionPanel
            attention={data.attention}
            linkComponent={linkComponent}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
            aria-label={t("dashboard.keyMetrics")}
          >
            <DashboardMetricCard
              label={t("dashboard.activeCampaignMetric")}
              value={String(data.metrics.activeCampaigns)}
              detail={t("dashboard.activeCampaignMetricHint")}
              icon={<Activity size={18} aria-hidden="true" />}
            />
            <DashboardMetricCard
              label={t("dashboard.recipientsTargeted")}
              value={String(data.metrics.recipientsTargeted)}
              detail={t("dashboard.inLastThirtyDays")}
              icon={<Users size={18} aria-hidden="true" />}
            />
            <DashboardMetricCard
              label={t("dashboard.deliveryRate")}
              value={`${data.metrics.deliveryRate}%`}
              detail={t("dashboard.ratioDetail", {
                value: data.metrics.delivered,
                total: data.metrics.recipientsTargeted,
              })}
              icon={<Send size={18} aria-hidden="true" />}
            />
            <DashboardMetricCard
              label={t("dashboard.riskRate")}
              value={`${data.metrics.riskRate}%`}
              detail={t("dashboard.riskRateHint", {
                count: data.metrics.riskRecipients,
              })}
              icon={<AlertTriangle size={18} aria-hidden="true" />}
            />
            <DashboardMetricCard
              label={t("dashboard.reportingRate")}
              value={`${data.metrics.reportingRate}%`}
              detail={t("dashboard.reportingRateHint", {
                count: data.metrics.reportedRecipients,
              })}
              icon={<Flag size={18} aria-hidden="true" />}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <EngagementFunnel funnel={data.funnel} />
            <AttentionPanel
              attention={data.attention}
              linkComponent={linkComponent}
            />
          </div>

          {timeline}
        </div>
      )}
    </div>
  );
}
