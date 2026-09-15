"use client";

import type { ElementType } from "react";
import {
  AlertTriangle,
  CircleCheck,
  CirclePause,
  MailWarning,
  MoveRight,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@next-phish/ui";
import type { OrganizationDashboardView } from "@next-phish/backend";
import { useTranslation } from "../../../lib/i18n";

interface AttentionPanelProps {
  attention: OrganizationDashboardView["attention"];
  linkComponent?: ElementType;
}

export function AttentionPanel({
  attention,
  linkComponent: Link = "a",
}: AttentionPanelProps) {
  const t = useTranslation();
  const items = [
    ...(attention.deliveryDisabled
      ? [
          {
            key: "delivery",
            icon: CirclePause,
            title: t("dashboard.deliveryDisabled"),
            detail: t("dashboard.deliveryDisabledHint"),
            href: "/organizations",
          },
        ]
      : []),
    ...(attention.brokenCampaigns
      ? [
          {
            key: "broken",
            icon: AlertTriangle,
            title: t("dashboard.brokenCampaigns", {
              count: attention.brokenCampaigns,
            }),
            detail: t("dashboard.brokenCampaignsHint"),
            href: "/campaigns",
          },
        ]
      : []),
    ...(attention.failedDeliveries
      ? [
          {
            key: "failed",
            icon: MailWarning,
            title: t("dashboard.failedDeliveries", {
              count: attention.failedDeliveries,
            }),
            detail: t("dashboard.failedDeliveriesHint"),
            href: "/campaigns",
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader
        title={t("dashboard.requiresAttention")}
        description={t("dashboard.requiresAttentionHint")}
      />
      <CardBody className="pt-0">
        {items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-[#d9eee3] bg-[#eef8f3] p-4 text-[#176d51]">
            <CircleCheck
              className="mt-0.5 shrink-0"
              size={19}
              aria-hidden="true"
            />
            <p className="text-sm">{t("dashboard.nothingRequiresAttention")}</p>
          </div>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-[#f1dfc6] bg-[#fff8ed] p-4 text-[#754b18] transition-colors hover:bg-[#fff3df]"
                >
                  <item.icon
                    className="mt-0.5 shrink-0"
                    size={18}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#806846]">
                      {item.detail}
                    </span>
                  </span>
                  <MoveRight
                    className="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
