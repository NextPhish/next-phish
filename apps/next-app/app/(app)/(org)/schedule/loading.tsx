"use client";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
export default function Loading() {
  const t = useTranslation();
  return (
    <div
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-[22px] min-[361px]:gap-7 [&>.np-page-header]:mb-0"
      role="status"
      aria-label={t("common.loading")}
    >
      <Skeleton style={{ width: "45%", height: 32 }} />
      <Skeleton style={{ width: "70%", height: 18 }} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 min-[361px]:grid-cols-2 min-[1001px]:grid-cols-4">
        {["one", "two", "three", "four"].map((id) => (
          <Skeleton key={id} className="h-[124px] rounded-xl" />
        ))}
      </div>
      <Skeleton style={{ height: 300 }} />
      <Skeleton style={{ height: 280 }} />
    </div>
  );
}
