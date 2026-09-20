import Link from "next/link";
import { getTranslator } from "@/src/lib/i18n/server";
import { redirect } from "next/navigation";
import { Container } from "@/src/server/container";
import { MessageBus, GetUserCountQuery } from "@next-phish/backend";
import { Setup, SetupScreen } from "@/src/components/organisms/setup";

export const dynamic = "force-dynamic";
export default async function SetupPage() {
  const bus = Container.get(MessageBus);
  const count = await bus.query(Container.get(GetUserCountQuery), {});
  if (count > 0) redirect("/login");
  const t = await getTranslator();
  return (
    <SetupScreen signInLink={<Link href="/login">{t("common.signIn")}</Link>}>
      <Setup />
    </SetupScreen>
  );
}
