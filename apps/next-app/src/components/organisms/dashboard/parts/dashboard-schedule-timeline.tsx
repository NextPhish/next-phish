"use client";

import { ScheduleTimeline } from "@/src/components/organisms/schedules";
import { useLocale, useTranslation } from "@/src/lib/i18n";

/** Keeps the timeline's live query and navigation while adapting its legacy surface to V1. */
export function DashboardScheduleTimeline() {
  const t = useTranslation();
  const locale = useLocale();

  return (
    <ScheduleTimeline
      variant="v1"
      locale={locale}
      labels={{
        title: t("dashboard.timelineTitle"),
        description: t("dashboard.timelineDescription"),
        range: t("dashboard.nextThreeMonths"),
        schedules: t("dashboard.timelineSchedules"),
        campaigns: t("dashboard.timelineCampaigns"),
        empty: t("dashboard.timelineEmpty"),
        error: t("dashboard.timelineError"),
      }}
    />
  );
}
