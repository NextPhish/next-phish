"use client";

import { useFormikContext } from "formik";
import { FormField, Select } from "@next-phish/ui";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";

export function GeneralApiConfigFields() {
  const t = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SendingProfileFormValues>();
  const authMethod = values.providerConfig?.authMethod ?? "";

  const authMethodOptions = [
    { label: t("sendingProfiles.generalAuthBearer"), value: "bearer" },
    { label: t("sendingProfiles.generalAuthHeader"), value: "header" },
  ];

  return (
    <>
      <ConfigInput
        name="providerConfig.apiKey"
        label={t("sendingProfiles.generalApiKey")}
        secret
        autoComplete="off"
      />
      <ConfigInput
        name="providerConfig.sendEndpoint"
        label={t("sendingProfiles.generalSendEndpoint")}
        placeholder="https://api.example.com/send"
      />
      <FormField
        id="sending-providerConfig-authMethod"
        label={t("sendingProfiles.generalAuthMethod")}
      >
        {(control) => (
          <Select
            {...control}
            value={authMethod}
            options={authMethodOptions}
            onValueChange={(value) =>
              setFieldValue("providerConfig.authMethod", value)
            }
          />
        )}
      </FormField>
      {authMethod === "header" && (
        <ConfigInput
          name="providerConfig.authHeaderName"
          label={t("sendingProfiles.generalAuthHeaderName")}
          placeholder="X-API-Key"
        />
      )}
    </>
  );
}
