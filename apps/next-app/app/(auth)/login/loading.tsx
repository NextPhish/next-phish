import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@next-phish/ui";
import styles from "./login.module.css";

export default function LoginLoading() {
  return (
    <div className={`np-theme ${styles.layout}`}>
      <aside className={styles.brandPanel}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <ShieldCheck className={styles.brandIcon} aria-hidden="true" />
          </span>
          nextphish.
        </div>
        <div className={styles.brandCopy} aria-hidden="true">
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonSubtitle} />
        </div>
        <span />
      </aside>
      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <Skeleton className={styles.skeletonPreview} />
          <Skeleton className={styles.skeletonTitle} />
          <Skeleton className={styles.skeletonSubtitle} />
          <div className={styles.form}>
            <div className="np-field">
              <Skeleton className={styles.skeletonLabel} />
              <Skeleton className={styles.skeletonInput} />
            </div>
            <div className="np-field">
              <Skeleton className={styles.skeletonLabel} />
              <Skeleton className={styles.skeletonInput} />
            </div>
            <Skeleton className={styles.skeletonButton} />
            <Skeleton className={styles.skeletonButton} />
          </div>
        </div>
      </main>
    </div>
  );
}
