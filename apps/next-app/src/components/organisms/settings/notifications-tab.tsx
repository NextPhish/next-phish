"use client";

import { Bell } from "lucide-react";
import { Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";
import styles from "./profile-settings.module.css";

export function NotificationsTab() {
  const t = useTranslation();
  return (
    <Card>
      <CardHeader
        title={t("settings.notificationsTitle")}
        description={t("settings.notificationsDescription")}
      />
      <CardBody>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Bell size={22} aria-hidden="true" />
          </span>
          <p>{t("settings.notificationsSoon")}</p>
        </div>
      </CardBody>
    </Card>
  );
}
