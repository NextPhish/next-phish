import { AuthLayoutSkeleton } from "@next-phish/ui";
import { getTranslator } from "@/src/lib/i18n/server";
export default async function OnboardingLoading() {
  const t = await getTranslator();
  return <AuthLayoutSkeleton fields={2} label={t("setup.loading")} />;
}
