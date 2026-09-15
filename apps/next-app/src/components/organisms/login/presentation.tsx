"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
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
  const [showPassword, setShowPassword] = useState(false);
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
              <div className={styles.passwordWrap}>
                <Field name="password">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <Input
                      {...controlProps}
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={t("login.passwordPlaceholder")}
                    />
                  )}
                </Field>
                <button
                  type="button"
                  className={styles.visibilityButton}
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-pressed={showPassword}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} aria-hidden="true" />
                  ) : (
                    <Eye size={17} aria-hidden="true" />
                  )}
                </button>
              </div>
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
