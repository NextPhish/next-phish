import { ScheduleDetailSkeleton } from "@/src/components/organisms/schedules/schedule-detail-skeleton";
import { getTranslator } from "@/src/lib/i18n/server";

export default async function Loading() {
  const t = await getTranslator();
  return <ScheduleDetailSkeleton label={t("scheduleUi.loadingDetail")} />;
}
