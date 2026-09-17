"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import styles from "@/app/(auth)/login/login.module.css";
import type { VerifyOtpValues } from "./presentation";

export function VerifyOtpView({ error }: { error: string }) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<VerifyOtpValues>();
  return (
    <Form
      className={styles.form}
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
      <Button
        type="submit"
        loading={isSubmitting}
        className={styles.submitButton}
      >
        {t("resetPassword.verifyCode")}
      </Button>
    </Form>
  );
}
