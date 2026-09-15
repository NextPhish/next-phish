import { AuthLayoutSkeleton } from "@next-phish/ui";
import { getTranslator } from "@/src/lib/i18n/server";
export default async function SetupLoading() {
  const t = await getTranslator();
  return <AuthLayoutSkeleton label={t("setup.loading")} />;
}
