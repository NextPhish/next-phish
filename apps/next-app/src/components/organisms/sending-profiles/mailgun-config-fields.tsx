"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function MailgunConfigFields() {
  const t = useTranslation();

  return (
    <>
      <ConfigInput
        name="providerConfig.apiKey"
        label={t("sendingProfiles.mailgunApiKey")}
        secret
        autoComplete="off"
      />
      <ConfigInput
        name="providerConfig.domain"
        label={t("sendingProfiles.mailgunDomain")}
      />
    </>
  );
}
