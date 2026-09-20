import { AuthLayout } from "@next-phish/ui";
import { TwoFactor } from "@/src/components/organisms/two-factor";
import { getTranslator } from "@/src/lib/i18n/server";

export default async function TwoFactorPage() {
  const t = await getTranslator();

  return (
    <AuthLayout
      badge={t("twoFactorPage.badge")}
      title={t("twoFactorPage.title")}
      subtitle={t("twoFactorPage.subtitle")}
      brandTitle={t("login.brandTitle")}
      brandDescription={t("login.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      <TwoFactor />
    </AuthLayout>
  );
}
