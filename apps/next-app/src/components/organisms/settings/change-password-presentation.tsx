"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, PasswordInput } from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";
import styles from "./profile-settings.module.css";

export interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPresentation({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<PasswordValues>();
  const fields = [
    {
      name: "currentPassword",
      label: t("settings.currentPassword"),
      placeholder: t("settings.enterCurrentPassword"),
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: t("resetPassword.newPassword"),
      placeholder: t("settings.atLeastEightCharacters"),
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: t("settings.confirmPassword"),
      placeholder: t("settings.repeatNewPassword"),
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <Form
      noValidate
      className={styles.form}
      aria-busy={isSubmitting || undefined}
    >
      <div className={styles.passwordGrid}>
        {fields.map(({ name, label, placeholder, autoComplete }) => (
          <FormField
            key={name}
            id={`security-${name}`}
            label={label}
            error={touched[name] ? errors[name] : undefined}
            required
          >
            {(control) => (
              <Field name={name}>
                {({ field }: { field: FieldInputProps<string> }) => (
                  <PasswordInput
                    {...control}
                    {...field}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                    showLabel={t("settings.showPassword")}
                    hideLabel={t("settings.hidePassword")}
                  />
                )}
              </Field>
            )}
          </FormField>
        ))}
      </div>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      {success && <FormMessage variant="success">{success}</FormMessage>}
      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>
          {t("settings.changePasswordAction")}
        </Button>
      </div>
    </Form>
  );
}
