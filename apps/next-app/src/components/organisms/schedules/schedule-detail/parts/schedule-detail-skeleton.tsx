import { Skeleton, SkeletonList } from "@next-phish/ui";

export function ScheduleDetailSkeleton({ label }: { label: string }) {
  return (
    <div className="grid gap-6" role="status" aria-label={label}>
      <Skeleton className="h-[4.5rem] rounded-xl" />
      <Skeleton className="h-10 w-[26rem] max-w-full rounded-lg" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 min-[901px]:grid-cols-[minmax(0,1.55fr)_minmax(18rem,1fr)]">
        <Skeleton className="h-72 rounded-2xl" />
        <div className="h-72 rounded-2xl">
          <SkeletonList label={label} />
        </div>
        <Skeleton className="h-80 rounded-2xl min-[901px]:col-span-full" />
      </div>
    </div>
  );
}
