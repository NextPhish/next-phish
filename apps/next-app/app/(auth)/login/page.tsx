import Link from "next/link";
import { AuthLayout } from "@next-phish/ui";
import { GetUserCountQuery, MessageBus } from "@next-phish/backend";
import { Login } from "@/src/components/organisms/login";
import { Container } from "@/src/server/container";
import {
  getAuthErrorMessage,
  getAuthSuccessMessage,
} from "@/src/lib/auth-errors";
import { createTranslator } from "@/src/lib/i18n";
import { getLocale } from "@/src/lib/i18n/server";

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
      <Login authError={authError} authSuccess={authSuccess} />
      {count === 0 && (
        <p className="mt-6 text-center text-[13px] text-[var(--np-muted)] [&_a:hover]:text-[var(--np-primary-hover)] [&_a]:font-semibold [&_a]:text-[var(--np-primary)]">
          {t("login.firstAdminPrompt")}{" "}
          <Link href="/setup">{t("login.startSetup")}</Link>
        </p>
      )}
    </AuthLayout>
  );
}
