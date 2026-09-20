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

interface LoginValues {
  email: string;
  password: string;
}
interface LoginViewProps {
  useMagicLink: boolean;
  onToggleMagicLink: () => void;
  error: string;
  success: string;
  authError?: string | null;
  authSuccess?: string | null;
  isSubmitting: boolean;
}

export function LoginView({
  useMagicLink,
  onToggleMagicLink,
  error,
  success,
  authError,
  authSuccess,
  isSubmitting,
}: LoginViewProps) {
  const t = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const { errors, touched } = useFormikContext<LoginValues>();

  return (
    <Form ref={formRef} className="grid gap-5" noValidate>
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
          <div className="-mt-0.5 flex items-start justify-between gap-3 text-xs text-[var(--np-muted)] [&_span]:max-w-[220px]">
            <span>{t("login.passwordHint")}</span>
            <Link
              href="/forgot-password"
              className="font-semibold text-[var(--np-primary)] hover:text-[var(--np-primary-hover)]"
            >
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
        className="mt-2 w-full"
        disabled={isSubmitting}
      >
        {useMagicLink ? t("login.sendMagicLink") : t("common.signIn")}
        {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={onToggleMagicLink}
        className="w-full"
        disabled={isSubmitting}
      >
        {useMagicLink
          ? t("login.signInWithPasswordInstead")
          : t("login.signInWithMagicLinkInstead")}
      </Button>
    </Form>
  );
}
