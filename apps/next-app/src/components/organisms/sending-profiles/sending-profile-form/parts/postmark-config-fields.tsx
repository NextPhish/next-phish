"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function PostmarkConfigFields() {
  const t = useTranslation();

  return (
    <ConfigInput
      name="providerConfig.apiKey"
      label={t("sendingProfiles.postmarkApiKey")}
      secret
      autoComplete="off"
    />
  );
}
