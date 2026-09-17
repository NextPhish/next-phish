import { Skeleton } from "@next-phish/ui";
import styles from "./organization-detail.module.css";
export function OrganizationDetailSkeleton() {
  return (
    <div
      className={styles.page}
      role="status"
      aria-label="Loading organization"
    >
      <Skeleton style={{ width: "42%", height: 38 }} />
      <Skeleton style={{ width: "65%", height: 18 }} />
      <div className={styles.analyticsGrid}>
        <Skeleton className={styles.chartSkeleton} />
        <Skeleton className={styles.chartSkeleton} />
      </div>
      <Skeleton style={{ width: 140, height: 26 }} />
      <Skeleton style={{ height: 420 }} />
    </div>
  );
}
