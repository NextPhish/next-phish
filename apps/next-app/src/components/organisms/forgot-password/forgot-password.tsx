"use client";

import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { authClient } from "@/src/lib/auth-client";
import { forgotPasswordSchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { ForgotPasswordView } from "./parts/forgot-password-view";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

interface ForgotPasswordValues {
  email: string;
}

export function ForgotPassword() {
  const t = useTranslation();
  const router = useRouter();
  const { status, setError, reset } = useFormStatus();

  async function handleSubmit(values: ForgotPasswordValues) {
    reset();

    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: values.email,
      });
      if (error) {
        setError(t("forgotPassword.somethingWentWrong"));
        return;
      }
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch {
      setError(t("forgotPassword.somethingWentWrong"));
    }
  }

  return (
    <Formik<ForgotPasswordValues>
      initialValues={{ email: "" }}
      validate={toFormikValidation(forgotPasswordSchema)}
      onSubmit={handleSubmit}
    >
      <ForgotPasswordView
        error={status.type === "error" ? status.message : ""}
      />
    </Formik>
  );
}
