import { SettingsContainer } from "@/src/components/organisms/settings";
import { getTranslator } from "@/src/lib/i18n/server";
import { PageHeader } from "@next-phish/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const t = await getTranslator();

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title={t("settings.applicationTitle")}
        description={t("settings.applicationDescription")}
      />
      <SettingsContainer />
    </div>
  );
}
