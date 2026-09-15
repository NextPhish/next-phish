import type { CSSProperties } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { GetUserCountQuery, MessageBus } from "@next-phish/backend";
import { LoginContainer } from "@/src/components/organisms/login";
import { Container } from "@/src/server/container";
import {
  getAuthErrorMessage,
  getAuthSuccessMessage,
} from "@/src/lib/auth-errors";
import { createTranslator } from "@/src/lib/i18n";
import { getLocale } from "@/src/lib/i18n/server";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const bus = Container.get(MessageBus);
  const handler = Container.get(GetUserCountQuery);
  const [locale, resolvedSearchParams, count] = await Promise.all([
    getLocale(),
    searchParams,
    bus.query(handler, {}),
  ]);
  const t = createTranslator(locale);
  const { error: errorCode, message: messageCode } = resolvedSearchParams;
  const authError = getAuthErrorMessage(
    typeof errorCode === "string" ? errorCode : undefined,
    locale,
  );
  const authSuccess = getAuthSuccessMessage(
    typeof messageCode === "string" ? messageCode : undefined,
    locale,
  );

  return (
    <div className={`np-theme ${styles.layout}`}>
      <aside className={styles.brandPanel}>
        <Link href="/" className={styles.brand} aria-label="NextPhish">
          <span className={styles.brandMark}>
            <ShieldCheck className={styles.brandIcon} aria-hidden="true" />
          </span>
          nextphish.
        </Link>
        <div className={styles.brandCopy}>
          <h2>{t("login.brandTitle")}</h2>
          <p>{t("login.brandDescription")}</p>
          <div className={styles.brandArt} aria-hidden="true">
            {[18, 25, 22, 38, 33, 50, 58, 68].map((height, index) => (
              <span
                key={`${height}-${index}`}
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
        <small className={styles.brandFooter}>{t("login.brandFooter")}</small>
      </aside>
      <main className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.previewLabel}>{t("login.badge")}</div>
          <h1 className={styles.title}>{t("login.title")}</h1>
          <p className={styles.subtitle}>{t("login.subtitle")}</p>
          <LoginContainer authError={authError} authSuccess={authSuccess} />
          {count === 0 && (
            <p className={styles.setupPrompt}>
              {t("login.firstAdminPrompt")}{" "}
              <Link href="/setup">{t("login.startSetup")}</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
