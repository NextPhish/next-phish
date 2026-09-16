import type { ReactNode } from "react";
import styles from "./schedule-form.module.css";

export function ScheduleFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}
