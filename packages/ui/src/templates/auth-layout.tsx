import type { CSSProperties, ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Skeleton } from "../atoms/skeleton";
import styles from "./auth-layout.module.css";

export interface AuthLayoutProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  brandTitle: ReactNode;
  brandDescription?: ReactNode;
  brandFooter?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}
export function AuthLayout({
  title,
  subtitle,
  badge,
  brandTitle,
  brandDescription,
  brandFooter,
  footer,
  children,
  wide,
}: AuthLayoutProps) {
  return (
    <div className={`np-theme ${styles.layout}`}>
      <aside className={styles.brandPanel}>
        <a href="/" className={styles.brand} aria-label="NextPhish">
          <span className={styles.brandMark}>
            <ShieldCheck className={styles.brandIcon} aria-hidden="true" />
          </span>
          nextphish.
        </a>
        <div className={styles.brandCopy}>
          <h2>{brandTitle}</h2>
          <p>{brandDescription}</p>
          <div className={styles.brandArt} aria-hidden="true">
            {[18, 25, 22, 38, 33, 50, 58, 68].map((height, index) => (
              <span
                key={index}
                style={
                  {
                    "--bar-height": `${height}px`,
                    "--bar-opacity": 0.4 + index * 0.08,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
        <small className={styles.brandFooter}>{brandFooter}</small>
      </aside>
      <main className={styles.formPanel}>
        <div className={`${styles.formInner} ${wide ? styles.wide : ""}`}>
          <div className={styles.previewLabel}>{badge}</div>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.subtitle}>{subtitle}</div>
          {children}
          {footer && <div className={styles.setupPrompt}>{footer}</div>}
        </div>
      </main>
    </div>
  );
}
export function AuthLayoutSkeleton({
  fields = 4,
  label = "Loading…",
}: {
  fields?: number;
  label?: string;
}) {
  return (
    <AuthLayout
      wide
      badge={<Skeleton className={styles.skeletonPreview} />}
      title={<Skeleton className={styles.skeletonTitle} />}
      subtitle={<Skeleton className={styles.skeletonSubtitle} />}
      brandTitle={<Skeleton className={styles.skeletonTitle} />}
    >
      <div role="status" aria-label={label} className={styles.form}>
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="np-field">
            <Skeleton className={styles.skeletonLabel} />
            <Skeleton className={styles.skeletonInput} />
          </div>
        ))}
        <Skeleton className={styles.skeletonButton} />
      </div>
    </AuthLayout>
  );
}
