"use client";

import { useRouter } from "next/navigation";
import { Formik, type FormikErrors } from "formik";
import { twoFactorCodeSchema } from "@next-phish/shared";
import { authClient } from "@/src/lib/auth-client";
import { TwoFactorPresentation } from "./presentation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

export interface TwoFactorValues {
  code: string;
}

export function TwoFactorContainer() {
  const t = useTranslation();
  const router = useRouter();
  const { status, setError, reset } = useFormStatus();

  function validate(values: TwoFactorValues) {
    const errors: FormikErrors<TwoFactorValues> = {};
    if (!twoFactorCodeSchema.shape.verifyCode.safeParse(values.code).success) {
      errors.code = t("twoFactorPage.invalidCode");
    }
    return errors;
  }

  async function handleVerify(values: TwoFactorValues) {
    reset();
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: values.code,
        trustDevice: true,
      });
      if (error) {
        setError(
          error.code === "INVALID_CODE"
            ? t("twoFactorPage.invalidCode")
            : t("settings.unexpectedTwoFactorError"),
        );
        return;
      }
      router.push("/");
    } catch {
      setError(t("settings.unexpectedTwoFactorError"));
    }
  }

  return (
    <Formik<TwoFactorValues>
      initialValues={{ code: "" }}
      validate={validate}
      onSubmit={handleVerify}
    >
      <TwoFactorPresentation
        error={status.type === "error" ? status.message : ""}
      />
    </Formik>
  );
}
