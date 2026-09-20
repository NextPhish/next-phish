import { Skeleton } from "@next-phish/ui";
export function OrganizationDetailSkeleton() {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] gap-6 text-[var(--np-ink)]"
      role="status"
      aria-label="Loading organization"
    >
      <Skeleton style={{ width: "42%", height: 38 }} />
      <Skeleton style={{ width: "65%", height: 18 }} />
      <div className="grid grid-cols-1 gap-4 min-[851px]:grid-cols-2">
        <Skeleton className="min-h-80 rounded-2xl" />
        <Skeleton className="min-h-80 rounded-2xl" />
      </div>
      <Skeleton style={{ width: 140, height: 26 }} />
      <Skeleton style={{ height: 420 }} />
    </div>
  );
}
