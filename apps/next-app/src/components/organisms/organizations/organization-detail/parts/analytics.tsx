"use client";

import { Button, FormMessage, Skeleton } from "@next-phish/ui";
import {
  CampaignsChart,
  EmailStatsChart,
} from "@/src/components/molecules/charts";
import { useTranslation } from "@/src/lib/i18n/client";
import type { OrganizationAnalyticsMonth } from "@next-phish/backend";

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
      <div className="grid grid-cols-1 gap-4 min-[851px]:grid-cols-2">
        <Skeleton className="min-h-80 rounded-2xl" />
        <Skeleton className="min-h-80 rounded-2xl" />
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
    <div className="grid grid-cols-1 gap-4 min-[851px]:grid-cols-2">
      <CampaignsChart months={months} variant="v1" />
      <EmailStatsChart months={months} variant="v1" />
    </div>
  );
}
