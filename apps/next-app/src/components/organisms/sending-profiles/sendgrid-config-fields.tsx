"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function SendGridConfigFields() {
  const t = useTranslation();

  return (
    <ConfigInput
      name="providerConfig.apiKey"
      label={t("sendingProfiles.sendgridApiKey")}
      secret
      autoComplete="off"
    />
  );
}
