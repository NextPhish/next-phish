import { Skeleton, SkeletonList } from "@next-phish/ui";
import styles from "./schedule-detail.module.css";

export function ScheduleDetailSkeleton({ label }: { label: string }) {
  return (
    <div className={styles.skeletonRoot} role="status" aria-label={label}>
      <Skeleton className={styles.skeletonHeader} />
      <Skeleton className={styles.skeletonActions} />
      <div className={styles.skeletonGrid}>
        <Skeleton className={styles.skeletonCard} />
        <div className={styles.skeletonCard}>
          <SkeletonList label={label} />
        </div>
        <Skeleton className={styles.skeletonTable} />
      </div>
    </div>
  );
}
