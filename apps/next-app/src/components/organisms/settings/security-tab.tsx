"use client";

import { Card, CardBody, CardHeader } from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";
import { ChangePasswordForm } from "./change-password-form";
import { TwoFactorContainer } from "./two-factor/container";
import styles from "./profile-settings.module.css";

interface SecurityTabProps {
  user: { id: string; email: string; twoFactorEnabled?: boolean | null };
}

export function SecurityTab({ user }: SecurityTabProps) {
  const t = useTranslation();
  return (
    <div className={styles.cardStack}>
      <Card>
        <CardHeader
          title={t("settings.changePassword")}
          description={t("settings.changePasswordHint")}
        />
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>
      <TwoFactorContainer user={user} />
    </div>
  );
}
