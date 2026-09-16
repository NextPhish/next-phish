"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function MsGraphConfigFields() {
  const t = useTranslation();

  return (
    <>
      <ConfigInput
        name="providerConfig.tenantId"
        label={t("sendingProfiles.graphTenantId")}
      />
      <ConfigInput
        name="providerConfig.clientId"
        label={t("sendingProfiles.graphClientId")}
      />
      <ConfigInput
        name="providerConfig.clientSecret"
        label={t("sendingProfiles.graphClientSecret")}
        secret
        autoComplete="off"
      />
      <ConfigInput
        name="providerConfig.senderMailbox"
        label={t("sendingProfiles.graphSenderMailbox")}
      />
    </>
  );
}
