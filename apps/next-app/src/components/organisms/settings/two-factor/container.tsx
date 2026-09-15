"use client";

import { Formik, type FormikHelpers, type FormikProps } from "formik";
import { useRef } from "react";
import {
  twoFactorCodeSchema,
  twoFactorPasswordSchema,
} from "@next-phish/shared";
import { authClient } from "@/src/lib/auth-client";
import { useTwoFactorState } from "@/src/hooks/use-two-factor-state";
import { useTranslation } from "@/src/lib/i18n";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { TwoFactorPresentation, type TwoFactorValues } from "./presentation";

interface TwoFactorContainerProps {
  user: { id: string; email: string; twoFactorEnabled?: boolean | null };
}

export function TwoFactorContainer({ user }: TwoFactorContainerProps) {
  const t = useTranslation();
  const { data: session } = authClient.useSession();
  const isEnabled = session?.user?.twoFactorEnabled ?? user.twoFactorEnabled;
  const {
    state: { step, status, totpUri, backupCodes },
    setError,
    setupTotp,
    enableTotp,
    confirmDisable,
    complete,
    reset,
  } = useTwoFactorState();
  const schema =
    step === "setup" ? twoFactorCodeSchema : twoFactorPasswordSchema;
  const baseValidate = toFormikValidation(schema);
  const formikRef = useRef<FormikProps<TwoFactorValues>>(null);

  function validate(values: TwoFactorValues) {
    return Object.fromEntries(
      Object.entries(baseValidate(values)).map(([field, message]) => [
        field,
        t(`settings.validation.${message}`),
      ]),
    );
  }

  async function handleSubmit(
    values: TwoFactorValues,
    helpers: FormikHelpers<TwoFactorValues>,
  ) {
    setError("");
    try {
      if (step === "password-enable-totp") {
        const { data, error } = await authClient.twoFactor.enable({
          password: values.password,
        });
        if (error) {
          setError(t("settings.failedToEnable2fa"));
          return;
        }
        if (!data) {
          setError(t("settings.failedToEnable2fa"));
          return;
        }
        helpers.resetForm();
        setupTotp(data.totpURI, data.backupCodes);
        return;
      }
      if (step === "setup") {
        const { error } = await authClient.twoFactor.verifyTotp({
          code: values.verifyCode,
        });
        if (error) {
          setError(t("twoFactorPage.invalidCode"));
          return;
        }
        helpers.resetForm();
        complete(t("settings.authenticatorConfigured"));
        return;
      }
      if (step === "password-disable") {
        const { error } = await authClient.twoFactor.disable({
          password: values.password,
        });
        if (error) {
          setError(t("settings.failedToDisable2fa"));
          return;
        }
        helpers.resetForm();
        reset();
      }
    } catch {
      setError(t("settings.unexpectedTwoFactorError"));
    }
  }

  function handleClose() {
    formikRef.current?.resetForm();
    reset();
  }

  return (
    <Formik<TwoFactorValues>
      innerRef={formikRef}
      initialValues={{ password: "", verifyCode: "" }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      <TwoFactorPresentation
        isEnabled={Boolean(isEnabled)}
        step={step}
        error={status.type === "error" ? status.message : ""}
        success={status.type === "success" ? status.message : ""}
        totpUri={totpUri}
        backupCodes={backupCodes}
        onEnable={enableTotp}
        onDisable={confirmDisable}
        onClose={handleClose}
      />
    </Formik>
  );
}
