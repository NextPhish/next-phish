import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div
      className="np-theme grid min-h-screen bg-[var(--np-surface)] lg:grid-cols-2"
      aria-busy="true"
    >
      <div className="hidden bg-[var(--np-nav)] lg:block" />
      <div className="flex items-center justify-center p-8">
        <div className="grid w-full max-w-md gap-6">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
