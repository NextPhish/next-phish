"use client";

import type {
  ResetPasswordValues,
  VerifyOtpValues,
} from "../types/reset-password.types";
import { ResetPasswordView } from "./reset-password-view";
import { VerifyOtpView } from "./verify-otp-view";

export type { ResetPasswordValues, VerifyOtpValues };

export function ResetPasswordFlow({
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
