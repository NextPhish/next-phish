"use client";

import { Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "../../../../../lib/i18n";
import { ChangePassword } from "../../change-password";
import { TwoFactorSettings } from "../../two-factor";

interface SecuritySettingsProps {
  user: { id: string; email: string; twoFactorEnabled?: boolean | null };
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const t = useTranslation();
  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          title={t("settings.changePassword")}
          description={t("settings.changePasswordHint")}
        />
        <CardBody>
          <ChangePassword />
        </CardBody>
      </Card>
      <TwoFactorSettings user={user} />
    </div>
  );
}
