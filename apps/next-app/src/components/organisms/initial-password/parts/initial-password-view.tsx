"use client";

import { Field, Form, useFormikContext } from "formik";
import type { FieldInputProps } from "formik";
import { Button, FormField, FormMessage, PasswordInput } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";

interface Values {
  password: string;
  confirmPassword: string;
}

export function InitialPasswordView({ error }: { error: string }) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<Values>();

  return (
    <Form
      className="grid gap-5"
      noValidate
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="initial-password"
        label={t("initialPassword.newPassword")}
        hint={t("setup.passwordHint")}
        required
        error={touched.password ? errors.password : undefined}
      >
        {(control) => (
          <Field name="password">
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
        id="initial-confirm-password"
        label={t("initialPassword.confirmPassword")}
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
                disabled={isSubmitting}
                showLabel={t("login.showPassword")}
                hideLabel={t("login.hidePassword")}
              />
            )}
          </Field>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <Button type="submit" loading={isSubmitting} className="w-full">
        {t("initialPassword.submit")}
      </Button>
    </Form>
  );
}
