import { ScheduleForm } from "@/src/components/organisms/schedules";

export const dynamic = "force-dynamic";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;
  return <ScheduleForm campaignId={campaignId} />;
}
