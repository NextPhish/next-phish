"use client";

import { Form, Field, useFormikContext, type FieldInputProps } from "formik";
import { Button, Input, FormField, FormMessage } from "@next-phish/ui";
import Link from "next/link";
import { useTranslation } from "@/src/lib/i18n";

interface ForgotPasswordViewProps {
  error: string;
}
export function ForgotPasswordView({ error }: ForgotPasswordViewProps) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<{
    email: string;
  }>();
  return (
    <Form className="grid gap-5" noValidate>
      <FormField
        id="recovery-email"
        label={t("common.email")}
        hint={t("forgotPassword.hint")}
        error={
          touched.email && errors.email
            ? t("login.validation.invalidEmail")
            : undefined
        }
        required
      >
        {(controlProps) => (
          <Field name="email">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...controlProps}
                {...field}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          </Field>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        {t("forgotPassword.sendVerificationCode")}
      </Button>
      <p className="mt-6 text-center text-[13px] text-[var(--np-muted)] [&_a]:font-semibold [&_a]:text-[var(--np-primary)] [&_a:hover]:text-[var(--np-primary-hover)]">
        {t("forgotPassword.rememberPassword")}{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--np-primary)] hover:text-[var(--np-primary-hover)]"
        >
          {t("common.signIn")}
        </Link>
      </p>
    </Form>
  );
}
