"use client";

import type { OrganizationDashboardView } from "@next-phish/backend";
import { Badge, Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";

interface EngagementFunnelProps {
  funnel: OrganizationDashboardView["funnel"];
}

export function EngagementFunnel({ funnel }: EngagementFunnelProps) {
  const t = useTranslation();
  const steps = [
    ["scheduled", t("dashboard.scheduled"), "#8f98a9"],
    ["sent", t("charts.sent"), "#6d60dc"],
    ["opened", t("charts.opened"), "#4ab3a5"],
    ["clicked", t("charts.clicked"), "#8a79e3"],
    ["submitted", t("charts.submitted"), "#b06fcb"],
    ["reported", t("charts.reported"), "#c98b3d"],
  ] as const;
  const maximum = Math.max(funnel.scheduled, 1);

  return (
    <Card>
      <CardHeader
        title={t("dashboard.engagementFunnel")}
        description={t("dashboard.engagementFunnelHint")}
        action={<Badge>{t("dashboard.lastThirtyDays")}</Badge>}
      />
      <CardBody className="space-y-4 pt-0">
        {steps.map(([field, label, color]) => {
          const value = funnel[field];
          const percentage = Math.round((value / maximum) * 100);
          return (
            <div key={field}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-ui-muted">
                  {value} · {percentage}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eeedf8]">
                <div
                  className="h-full min-w-0 rounded-full"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
