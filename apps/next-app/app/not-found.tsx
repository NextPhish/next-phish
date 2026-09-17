import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslator } from "@/src/lib/i18n/server";
import styles from "./not-found.module.css";

export default async function NotFound() {
  const t = await getTranslator();

  return (
    <div className={`np-theme ${styles.layout}`}>
      <aside className={styles.brandPanel} aria-label="NextPhish">
        <Link href="/" className={styles.brand} aria-label="NextPhish">
          <span className={styles.brandMark}>
            <ShieldCheck size={19} aria-hidden="true" />
          </span>
          nextphish.
        </Link>

        <div className={styles.routeArt} aria-hidden="true">
          <span className={styles.routeStart} />
          <span className={styles.routeLine} />
          <span className={styles.routeEnd}>?</span>
          <span className={styles.errorCode}>404</span>
        </div>

        <span className={styles.brandFooter}>NextPhish</span>
      </aside>

      <main className={styles.contentPanel}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>404</span>
          <h1>{t("notFound.title")}</h1>
          <p>{t("notFound.description")}</p>
          <Link href="/" className={styles.homeLink}>
            {t("notFound.backToDashboard")}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </main>
    </div>
  );
}
