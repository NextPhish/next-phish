"use client";

import type { ElementType } from "react";
import { Check, ChevronRight } from "lucide-react";
import type { OrganizationDashboardView } from "@next-phish/backend";
import { Badge, Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";

interface SetupChecklistProps {
  readiness: OrganizationDashboardView["readiness"];
  linkComponent?: ElementType;
}

export function SetupChecklist({
  readiness,
  linkComponent: Link = "a",
}: SetupChecklistProps) {
  const t = useTranslation();
  const items = [
    {
      key: "targetGroups",
      label: t("dashboard.setupTargetGroup"),
      href: "/target-groups/new",
      complete: readiness.targetGroups > 0,
    },
    {
      key: "emailTemplates",
      label: t("dashboard.setupEmailTemplate"),
      href: "/email-templates/new",
      complete: readiness.emailTemplates > 0,
    },
    {
      key: "pages",
      label: t("dashboard.setupPage"),
      href: "/pages/new",
      complete: readiness.pages > 0,
    },
    {
      key: "sendingProfiles",
      label: t("dashboard.setupSendingProfile"),
      href: "/sending-profiles/new",
      complete: readiness.sendingProfiles > 0,
    },
    {
      key: "campaigns",
      label: t("dashboard.setupCampaign"),
      href: "/campaigns/new",
      complete: readiness.campaigns > 0,
    },
  ];
  const completed = items.filter((item) => item.complete).length;

  return (
    <Card>
      <CardHeader
        title={t("dashboard.prepareFirstCampaign")}
        description={t("dashboard.prepareFirstCampaignHint")}
      />
      <CardBody className="pt-0">
        <div className="mb-4">
          <Badge tone="info">
            {completed} / {items.length} · {t("dashboard.setupProgress")}
          </Badge>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#eeedf8]">
          <div
            className="h-full rounded-full bg-ui-primary transition-[width]"
            style={{ width: `${(completed / items.length) * 100}%` }}
          />
        </div>
        <ol className="m-0 list-none p-0">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="border-b border-ui-border last:border-0"
            >
              <Link
                href={item.href}
                className="group flex items-center gap-4 py-4 transition-colors hover:text-ui-primary"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    item.complete
                      ? "bg-[#e7f5ef] text-[#157657]"
                      : "bg-ui-tint text-ui-primary"
                  }`}
                >
                  {item.complete ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`min-w-0 flex-1 text-sm font-medium ${item.complete ? "text-ui-muted line-through" : ""}`}
                >
                  {item.label}
                </span>
                <ChevronRight
                  className="shrink-0 text-ui-muted transition-transform group-hover:translate-x-0.5"
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
