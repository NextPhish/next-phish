import { ScheduleForm } from "@/src/components/organisms/schedules";

export const dynamic = "force-dynamic";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScheduleForm scheduleId={id} />;
}
