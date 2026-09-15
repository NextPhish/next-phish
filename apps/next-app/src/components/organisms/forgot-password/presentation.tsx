"use client";

import { Form, Field, useFormikContext, type FieldInputProps } from "formik";
import { Button, Input, FormField, FormMessage } from "@next-phish/ui";
import Link from "next/link";
import { useTranslation } from "@/src/lib/i18n";
import styles from "@/app/(auth)/login/login.module.css";

interface ForgotPasswordPresentationProps {
  error: string;
}
export function ForgotPasswordPresentation({
  error,
}: ForgotPasswordPresentationProps) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<{
    email: string;
  }>();
  return (
    <Form className={styles.form} noValidate>
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
        className={styles.submitButton}
      >
        {t("forgotPassword.sendVerificationCode")}
      </Button>
      <p className={styles.setupPrompt}>
        {t("forgotPassword.rememberPassword")}{" "}
        <Link href="/login" className={styles.authLink}>
          {t("common.signIn")}
        </Link>
      </p>
    </Form>
  );
}
