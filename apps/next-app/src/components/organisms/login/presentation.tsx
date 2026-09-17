"use client";

import { useRef } from "react";
import Link from "next/link";
import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { ArrowRight } from "lucide-react";
import {
  Button,
  FormField,
  FormMessage,
  Input,
  PasswordInput,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import styles from "@/app/(auth)/login/login.module.css";

interface LoginValues {
  email: string;
  password: string;
}
interface LoginPresentationProps {
  useMagicLink: boolean;
  onToggleMagicLink: () => void;
  error: string;
  success: string;
  authError?: string | null;
  authSuccess?: string | null;
  isSubmitting: boolean;
}

export function LoginPresentation({
  useMagicLink,
  onToggleMagicLink,
  error,
  success,
  authError,
  authSuccess,
  isSubmitting,
}: LoginPresentationProps) {
  const t = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const { errors, touched } = useFormikContext<LoginValues>();

  return (
    <Form ref={formRef} className={styles.form} noValidate>
      <FormField
        id="email"
        label={t("common.email")}
        hint={
          useMagicLink
            ? t("login.emailHintMagicLink")
            : t("login.emailHintPassword")
        }
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
      {!useMagicLink && (
        <>
          <FormField
            id="password"
            label={t("common.password")}
            error={
              touched.password && errors.password
                ? t("login.validation.passwordRequired")
                : undefined
            }
            required
          >
            {(controlProps) => (
              <Field name="password">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <PasswordInput
                    {...controlProps}
                    {...field}
                    autoComplete="current-password"
                    placeholder={t("login.passwordPlaceholder")}
                    showLabel={t("login.showPassword")}
                    hideLabel={t("login.hidePassword")}
                  />
                )}
              </Field>
            )}
          </FormField>
          <div className={styles.passwordMeta}>
            <span>{t("login.passwordHint")}</span>
            <Link href="/forgot-password" className={styles.authLink}>
              {t("login.forgotPassword")}
            </Link>
          </div>
        </>
      )}
      {authSuccess && (
        <FormMessage variant="success">{authSuccess}</FormMessage>
      )}
      {authError && <FormMessage variant="error">{authError}</FormMessage>}
      {error && <FormMessage variant="error">{error}</FormMessage>}
      {success && <FormMessage variant="success">{success}</FormMessage>}
      <Button
        type="submit"
        loading={isSubmitting}
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {useMagicLink ? t("login.sendMagicLink") : t("common.signIn")}
        {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={onToggleMagicLink}
        className={styles.secondaryButton}
        disabled={isSubmitting}
      >
        {useMagicLink
          ? t("login.signInWithPasswordInstead")
          : t("login.signInWithMagicLinkInstead")}
      </Button>
    </Form>
  );
}
