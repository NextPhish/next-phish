import { AuthLayout } from "@next-phish/ui";
import { ForgotPassword } from "@/src/components/organisms/forgot-password";
import { getTranslator } from "@/src/lib/i18n/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslator();
  return (
    <AuthLayout
      badge={t("forgotPassword.badge")}
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
      brandTitle={t("login.brandTitle")}
      brandDescription={t("login.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      <ForgotPassword />
    </AuthLayout>
  );
}
