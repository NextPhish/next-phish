import Link from "next/link";
import { AuthLayout, FormMessage } from "@next-phish/ui";
import { ResetPassword } from "@/src/components/organisms/reset-password";
import { getTranslator } from "@/src/lib/i18n/server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [t, resolvedSearchParams] = await Promise.all([
    getTranslator(),
    searchParams,
  ]);
  const emailParam = resolvedSearchParams.email;
  const email = typeof emailParam === "string" ? emailParam : "";

  return (
    <AuthLayout
      badge={t("resetPassword.badge")}
      title={t("resetPassword.title")}
      subtitle={email ? t("resetPassword.verifyIntro", { email }) : undefined}
      brandTitle={t("login.brandTitle")}
      brandDescription={t("login.brandDescription")}
      brandFooter={t("login.brandFooter")}
      footer={
        <>
          {t("forgotPassword.rememberPassword")}{" "}
          <Link href="/login">{t("common.signIn")}</Link>
        </>
      }
    >
      {email ? (
        <ResetPassword email={email} />
      ) : (
        <FormMessage
          variant="error"
          action={
            <Link
              href="/forgot-password"
              className="font-semibold text-[var(--np-primary)] hover:text-[var(--np-primary-hover)]"
            >
              {t("resetPassword.goToForgotPassword")}
            </Link>
          }
        >
          {t("resetPassword.missingEmail")}
        </FormMessage>
      )}
    </AuthLayout>
  );
}
