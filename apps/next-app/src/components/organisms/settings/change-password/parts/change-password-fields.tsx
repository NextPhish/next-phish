"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, PasswordInput } from "@next-phish/ui";
import { useTranslation } from "../../../../../lib/i18n";

export interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordFields({
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
      className="grid gap-5"
      aria-busy={isSubmitting || undefined}
    >
      <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2 min-[701px]:[&>:first-child]:col-span-full">
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
      <div className="flex justify-end gap-2.5">
        <Button type="submit" loading={isSubmitting}>
          {t("settings.changePasswordAction")}
        </Button>
      </div>
    </Form>
  );
}
