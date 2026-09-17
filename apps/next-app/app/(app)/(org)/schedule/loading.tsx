"use client";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import styles from "@/src/components/organisms/schedules/schedule-overview.module.css";
export default function Loading() {
  const t = useTranslation();
  return (
    <div
      className={styles.overview}
      role="status"
      aria-label={t("common.loading")}
    >
      <Skeleton style={{ width: "45%", height: 32 }} />
      <Skeleton style={{ width: "70%", height: 18 }} />
      <div className={styles.metrics}>
        {["one", "two", "three", "four"].map((id) => (
          <Skeleton key={id} className={styles.metricSkeleton} />
        ))}
      </div>
      <Skeleton style={{ height: 300 }} />
      <Skeleton style={{ height: 280 }} />
    </div>
  );
}
