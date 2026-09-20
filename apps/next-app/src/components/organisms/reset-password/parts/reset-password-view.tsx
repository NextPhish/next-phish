"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, PasswordInput } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";

import type { ResetPasswordValues } from "../types/reset-password.types";
export function ResetPasswordView({ error }: { error: string }) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } =
    useFormikContext<ResetPasswordValues>();
  return (
    <Form
      className="grid gap-5"
      noValidate
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="reset-password-new-password"
        label={t("resetPassword.newPassword")}
        hint={t("setup.passwordHint")}
        required
        error={touched.newPassword ? errors.newPassword : undefined}
      >
        {(control) => (
          <Field name="newPassword">
            {({ field }: { field: FieldInputProps<string> }) => (
              <PasswordInput
                {...control}
                {...field}
                autoComplete="new-password"
                disabled={isSubmitting}
                showLabel={t("login.showPassword")}
                hideLabel={t("login.hidePassword")}
              />
            )}
          </Field>
        )}
      </FormField>
      <FormField
        id="reset-password-confirm-password"
        label={t("resetPassword.confirmNewPassword")}
        required
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
      >
        {(control) => (
          <Field name="confirmPassword">
            {({ field }: { field: FieldInputProps<string> }) => (
              <PasswordInput
                {...control}
                {...field}
                autoComplete="new-password"
                placeholder={t("resetPassword.repeatNewPassword")}
                disabled={isSubmitting}
                showLabel={t("login.showPassword")}
                hideLabel={t("login.hidePassword")}
              />
            )}
          </Field>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        {t("resetPassword.resetAction")}
      </Button>
    </Form>
  );
}
