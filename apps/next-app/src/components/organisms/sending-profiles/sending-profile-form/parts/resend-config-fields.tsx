"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function ResendConfigFields() {
  const t = useTranslation();

  return (
    <ConfigInput
      name="providerConfig.apiKey"
      label={t("sendingProfiles.resendApiKey")}
      secret
      autoComplete="off"
    />
  );
}
