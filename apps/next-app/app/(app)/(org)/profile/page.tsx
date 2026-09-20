import { PageHeader } from "@next-phish/ui";
import { UserSettings } from "@/src/components/organisms/settings";
import { getRequiredSession } from "@/src/server/get-required-session";
import { getTranslator } from "@/src/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [t, session] = await Promise.all([
    getTranslator(),
    getRequiredSession(),
  ]);

  return (
    <div>
      <PageHeader
        title={t("settings.accountTitle")}
        description={t("settings.accountDescription")}
      />
      <UserSettings user={session.user} />
    </div>
  );
}
