import { redirect } from "next/navigation";
import {
  InitialPassword,
  InitialPasswordScreen,
} from "@/src/components/organisms/initial-password";
import { getRequiredSession } from "@/src/server/get-required-session";

export const dynamic = "force-dynamic";

export default async function InitialPasswordPage() {
  const session = await getRequiredSession();
  if (!session.userState.passwordSetupRequired) redirect("/");

  return (
    <InitialPasswordScreen>
      <InitialPassword />
    </InitialPasswordScreen>
  );
}
