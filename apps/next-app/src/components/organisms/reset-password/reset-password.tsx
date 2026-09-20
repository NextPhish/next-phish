"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { resetPasswordSchema, verifyOtpSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { authClient } from "@/src/lib/auth-client";
import { useTranslation } from "@/src/lib/i18n";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import {
  ResetPasswordFlow,
  type ResetPasswordValues,
  type VerifyOtpValues,
} from "./parts/reset-password-flow";

export function ResetPassword({ email }: { email: string }) {
  const t = useTranslation();
  const router = useRouter();
  const { status, setError, reset } = useFormStatus();
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRef = useRef("");
  const error = status.type === "error" ? status.message : "";
  const validateOtp = (values: VerifyOtpValues) => {
    const errors = toFormikValidation(verifyOtpSchema.omit({ email: true }))(
      values,
    );
    return errors.otp ? { otp: t("resetPassword.invalidOrExpiredCode") } : {};
  };
  const validatePassword = (values: ResetPasswordValues) => {
    const errors = toFormikValidation(resetPasswordSchema)(values);
    return {
      ...(errors.newPassword
        ? { newPassword: t("setup.validation.passwordTooShort") }
        : {}),
      ...(errors.confirmPassword
        ? { confirmPassword: t("setup.validation.passwordMismatch") }
        : {}),
    };
  };

  async function handleVerifyOtp(values: VerifyOtpValues) {
    reset();
    try {
      const { error: verificationError } =
        await authClient.emailOtp.checkVerificationOtp({
          email,
          type: "forget-password",
          otp: values.otp,
        });
      if (verificationError) {
        setError(t("resetPassword.invalidOrExpiredCode"));
        return;
      }
      otpRef.current = values.otp;
      setOtpVerified(true);
    } catch {
      setError(t("resetPassword.invalidOrExpiredCode"));
    }
  }

  async function handleResetPassword(values: ResetPasswordValues) {
    reset();
    try {
      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email,
        otp: otpRef.current,
        password: values.newPassword,
      });
      if (resetError) {
        setError(t("resetPassword.failedToResetPassword"));
        return;
      }
      router.push("/login?message=password-reset");
    } catch {
      setError(t("resetPassword.failedToResetPassword"));
    }
  }

  if (!otpVerified) {
    return (
      <Formik<VerifyOtpValues>
        key="verify-otp"
        initialValues={{ otp: "" }}
        validate={validateOtp}
        onSubmit={handleVerifyOtp}
      >
        <ResetPasswordFlow step="verify" error={error} />
      </Formik>
    );
  }
  return (
    <Formik<ResetPasswordValues>
      key="reset-password"
      initialValues={{ newPassword: "", confirmPassword: "" }}
      validate={validatePassword}
      onSubmit={handleResetPassword}
    >
      <ResetPasswordFlow step="reset" error={error} />
    </Formik>
  );
}
