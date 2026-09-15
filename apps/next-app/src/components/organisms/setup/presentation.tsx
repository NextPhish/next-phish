"use client";
import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import {
  Button,
  FormField,
  FormMessage,
  Input,
  PasswordInput,
} from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";
import styles from "./setup.module.css";
export interface SetupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export function SetupPresentation({ error }: { error: string }) {
  const t = useTranslation();
  const { values, errors, touched, isSubmitting } =
    useFormikContext<SetupValues>();
  const fields = [
    {
      name: "name",
      label: t("common.name"),
      hint: t("setup.nameHint"),
      placeholder: "Admin",
      autoComplete: "name",
      validation: "nameRequired",
    },
    {
      name: "email",
      label: t("common.email"),
      hint: t("setup.emailHint"),
      placeholder: "admin@example.com",
      autoComplete: "email",
      validation: "invalidEmail",
    },
    {
      name: "password",
      label: t("common.password"),
      hint: t("setup.passwordHint"),
      placeholder: t("settings.atLeastEightCharacters"),
      autoComplete: "new-password",
      validation: "passwordTooShort",
    },
    {
      name: "confirmPassword",
      label: t("setup.confirmPassword"),
      hint: t("setup.confirmPasswordHint"),
      placeholder: t("setup.confirmPassword"),
      autoComplete: "new-password",
      validation: "passwordMismatch",
    },
  ] as const;
  // Retain the existing PrimeReact strength categories as guidance, not validation rules.
  const strength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(
    values.password,
  )
    ? "strong"
    : /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/.test(
          values.password,
        )
      ? "good"
      : "weak";
  return (
    <Form
      noValidate
      className={styles.form}
      aria-busy={isSubmitting || undefined}
    >
      {fields.map(
        ({ name, label, hint, placeholder, autoComplete, validation }) => (
          <div key={name}>
            <FormField
              id={`setup-${name}`}
              label={label}
              hint={hint}
              required
              error={
                touched[name] && errors[name]
                  ? t(`setup.validation.${validation}`)
                  : undefined
              }
            >
              {(control) => (
                <Field name={name}>
                  {({ field }: { field: FieldInputProps<string> }) =>
                    name === "password" || name === "confirmPassword" ? (
                      <PasswordInput
                        {...control}
                        {...field}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        disabled={isSubmitting}
                        showLabel={t("login.showPassword")}
                        hideLabel={t("login.hidePassword")}
                      />
                    ) : (
                      <Input
                        {...control}
                        {...field}
                        type={name === "email" ? "email" : "text"}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        disabled={isSubmitting}
                      />
                    )
                  }
                </Field>
              )}
            </FormField>
            {name === "password" && values.password && (
              <div className={styles.strength} data-strength={strength}>
                <span className={styles.strengthTrack} aria-hidden="true">
                  <span />
                </span>
                <span>
                  {t("setup.passwordStrength")}: {t(`settings.${strength}`)}
                </span>
              </div>
            )}
          </div>
        ),
      )}
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <Button type="submit" loading={isSubmitting}>
        {t("setup.createAccount")}
      </Button>
    </Form>
  );
}
