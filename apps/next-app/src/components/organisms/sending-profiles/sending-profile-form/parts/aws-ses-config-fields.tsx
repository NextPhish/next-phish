"use client";

import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function AwsSesConfigFields() {
  const t = useTranslation();

  return (
    <>
      <ConfigInput
        name="providerConfig.region"
        label={t("sendingProfiles.sesRegion")}
      />
      <ConfigInput
        name="providerConfig.accessKeyId"
        label={t("sendingProfiles.sesAccessKeyId")}
        autoComplete="off"
      />
      <ConfigInput
        name="providerConfig.secretAccessKey"
        label={t("sendingProfiles.sesSecretAccessKey")}
        secret
        autoComplete="off"
      />
    </>
  );
}
