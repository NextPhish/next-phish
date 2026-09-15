"use client";

import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./loading.module.css";

export default function AppLoading() {
  const t = useTranslation();
  return (
    <div
      className={`np-theme np-shell ${styles.shell}`}
      role="status"
      aria-busy="true"
    >
      <span className="np-sr-only">{t("common.loading")}</span>
      <div className={`np-sidebar np-sidebar-desktop ${styles.sidebar}`}>
        <Skeleton className={styles.brand} />
        <Skeleton className={styles.organization} />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className={styles.navItem} />
        ))}
      </div>
      <div className="np-workspace">
        <div className="np-topbar">
          <Skeleton className={styles.breadcrumb} />
        </div>
        <div className="np-content">
          <Skeleton className={styles.heading} />
          <Skeleton className={styles.description} />
          <div className={styles.metrics}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className={styles.metric} />
            ))}
          </div>
          <Skeleton className={styles.panel} />
        </div>
      </div>
    </div>
  );
}
