"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";

import type { VerifyOtpValues } from "../types/reset-password.types";
export function VerifyOtpView({ error }: { error: string }) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<VerifyOtpValues>();
  return (
    <Form
      className="grid gap-5"
      noValidate
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="reset-password-otp"
        label={t("settings.verificationCode")}
        required
        error={touched.otp ? errors.otp : undefined}
      >
        {(control) => (
          <Field name="otp">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...control}
                {...field}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000000"
                className="text-center font-mono tracking-[0.3em] tabular-nums"
                disabled={isSubmitting}
              />
            )}
          </Field>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        {t("resetPassword.verifyCode")}
      </Button>
    </Form>
  );
}
