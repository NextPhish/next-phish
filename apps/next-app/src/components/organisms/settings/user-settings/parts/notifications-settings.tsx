"use client";

import { Bell } from "lucide-react";
import { Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "../../../../../lib/i18n";

export function NotificationsSettings() {
  const t = useTranslation();
  return (
    <Card>
      <CardHeader
        title={t("settings.notificationsTitle")}
        description={t("settings.notificationsDescription")}
      />
      <CardBody>
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3.5 text-center text-[var(--np-muted)]">
          <span className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--np-tint)] text-[var(--np-primary)]">
            <Bell size={22} aria-hidden="true" />
          </span>
          <p>{t("settings.notificationsSoon")}</p>
        </div>
      </CardBody>
    </Card>
  );
}
