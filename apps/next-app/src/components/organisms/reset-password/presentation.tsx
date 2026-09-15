"use client";

import { ResetPasswordView } from "./reset-password-view";
import { VerifyOtpView } from "./verify-otp-view";

export interface VerifyOtpValues {
  otp: string;
}
export interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordPresentation({
  step,
  error,
}: {
  step: "verify" | "reset";
  error: string;
}) {
  return step === "verify" ? (
    <VerifyOtpView error={error} />
  ) : (
    <ResetPasswordView error={error} />
  );
}
