import Link from "next/link";
import { AuthLayout } from "@next-phish/ui";
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
    <AuthLayout
      badge={t("login.badge")}
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      brandTitle={t("login.brandTitle")}
      brandDescription={t("login.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      <LoginContainer authError={authError} authSuccess={authSuccess} />
      {count === 0 && (
        <p className={styles.setupPrompt}>
          {t("login.firstAdminPrompt")}{" "}
          <Link href="/setup">{t("login.startSetup")}</Link>
        </p>
      )}
    </AuthLayout>
  );
}
