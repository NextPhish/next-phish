import { Card, Skeleton } from "@next-phish/ui";
import styles from "./tasks-board.module.css";

export function TaskBoardSkeleton({ label }: { label: string }) {
  return (
    <section className={styles.loading} aria-label={label}>
      <div className={styles.loadingHeader}>
        <div>
          <Skeleton className={styles.loadingTitle} />
          <Skeleton className={styles.loadingSubtitle} />
        </div>
        <Skeleton className={styles.loadingAction} />
      </div>
      <div className={styles.skeletonBoard}>
        {["first", "second", "third"].map((column) => (
          <Card className={styles.skeletonColumn} key={column}>
            <Skeleton className={styles.skeletonColumnTitle} />
            {["first", "second", "third"].map((task) => (
              <Skeleton className={styles.skeletonTask} key={task} />
            ))}
          </Card>
        ))}
      </div>
    </section>
  );
}
