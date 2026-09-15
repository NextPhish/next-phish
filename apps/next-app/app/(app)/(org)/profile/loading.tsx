"use client";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
export default function Loading() {
  const t = useTranslation();
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="np-sr-only">{t("common.loading")}</span>
      <Skeleton className="h-9 w-60 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="max-w-3xl space-y-5 rounded-xl border border-ui-border bg-ui-surface p-6">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
