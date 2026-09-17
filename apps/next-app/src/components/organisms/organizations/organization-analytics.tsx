"use client";

import { Button, FormMessage, Skeleton } from "@next-phish/ui";
import {
  CampaignsChart,
  EmailStatsChart,
} from "@/src/components/molecules/charts";
import { useTranslation } from "@/src/lib/i18n/client";
import type { OrganizationAnalyticsMonth } from "@next-phish/backend";
import styles from "./organization-detail.module.css";

export function OrganizationAnalytics({
  months,
  loading,
  error,
  onRetry,
}: {
  months: OrganizationAnalyticsMonth[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useTranslation();
  if (loading) {
    return (
      <div className={styles.analyticsGrid}>
        <Skeleton className={styles.chartSkeleton} />
        <Skeleton className={styles.chartSkeleton} />
      </div>
    );
  }
  if (error) {
    return (
      <FormMessage
        variant="error"
        action={
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t("tableUi.retry")}
          </Button>
        }
      >
        {error}
      </FormMessage>
    );
  }
  return (
    <div className={styles.analyticsGrid}>
      <CampaignsChart months={months} variant="v1" />
      <EmailStatsChart months={months} variant="v1" />
    </div>
  );
}
