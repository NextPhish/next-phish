"use client";

import { useFormikContext } from "formik";
import { Checkbox } from "@next-phish/ui";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";
import styles from "./sending-profile-form.module.css";

export function SmtpConfigFields() {
  const t = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<SendingProfileFormValues>();

  return (
    <>
      <ConfigInput
        name="providerConfig.host"
        label={t("sendingProfiles.smptHost")}
      />
      <ConfigInput
        name="providerConfig.port"
        label={t("sendingProfiles.smtpPort")}
      />
      <ConfigInput
        name="providerConfig.username"
        label={t("sendingProfiles.smtpUsername")}
        autoComplete="off"
      />
      <ConfigInput
        name="providerConfig.password"
        label={t("sendingProfiles.smtpPassword")}
        secret
        autoComplete="off"
      />
      <div className={styles.checkGroup}>
        {(["secure", "requireTls"] as const).map((key) => (
          <div className={styles.checkField} key={key}>
            <Checkbox
              id={`sending-${key}`}
              checked={values.providerConfig[key] === "true"}
              onCheckedChange={(checked) =>
                setFieldValue(`providerConfig.${key}`, String(checked === true))
              }
            />
            <label htmlFor={`sending-${key}`}>
              {t(
                key === "secure"
                  ? "sendingProfiles.smtpSecure"
                  : "sendingProfiles.smtpRequireTls",
              )}
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
