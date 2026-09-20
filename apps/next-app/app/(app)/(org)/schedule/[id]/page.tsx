import { ScheduleDetail } from "@/src/components/organisms/schedules";

export default async function ScheduleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <ScheduleDetail id={id} saved={saved} />;
}
