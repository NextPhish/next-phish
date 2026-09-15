"use client";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
export default function Loading() {
  const t = useTranslation();
  return (
    <div
      role="status"
      aria-label={t("common.loading")}
      className="grid min-w-0 gap-6"
    >
      <Skeleton style={{ width: "45%", height: 36 }} />
      <Skeleton style={{ width: "65%", height: 18 }} />
      <Skeleton style={{ height: 360, borderRadius: 12 }} />
    </div>
  );
}
