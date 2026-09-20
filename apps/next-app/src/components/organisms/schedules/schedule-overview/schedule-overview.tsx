"use client";
import { useRouter } from "next/navigation";
import { PageHeader, Button } from "@next-phish/ui";
import { Plus } from "lucide-react";
import { trpc } from "@/src/lib/trpc";
import { useLocale, useTranslation } from "@/src/lib/i18n";
import { ScheduleTable } from "../schedule-table";
import { ScheduleTimeline } from "../schedule-timeline";
import { ExecutionOperations } from "../execution-operations";
export function ScheduleOverview() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const t = useTranslation();
  const locale = useLocale();
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-[22px] min-[361px]:gap-7 [&>.np-page-header]:mb-0">
      <PageHeader
        title={t("scheduleUi.overviewTitle")}
        description={t("scheduleUi.overviewDescription")}
        actions={
          <Button onClick={() => router.push("/schedule/new")}>
            <Plus size={16} aria-hidden="true" />
            {t("scheduleUi.newSchedule")}
          </Button>
        }
      />
      <ExecutionOperations />
      <ScheduleTable
        onChanged={() => utils.campaign.getScheduleTimeline.invalidate()}
      />
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
    </div>
  );
}
