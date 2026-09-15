"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { ArrowRight } from "lucide-react";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import type { TwoFactorValues } from "./container";
import styles from "./two-factor.module.css";

interface TwoFactorPresentationProps {
  error: string;
}

export function TwoFactorPresentation({ error }: TwoFactorPresentationProps) {
  const t = useTranslation();
  const { errors, isSubmitting, touched } = useFormikContext<TwoFactorValues>();

  return (
    <Form className={styles.form} noValidate>
      <FormField
        id="two-factor-code"
        label={t("settings.verificationCode")}
        hint={t("twoFactorPage.intro")}
        error={touched.code ? errors.code : undefined}
        required
      >
        {(controlProps) => (
          <Field name="code">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...controlProps}
                {...field}
                className={styles.codeInput}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                autoFocus
                onChange={(event) => {
                  event.target.value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  field.onChange(event);
                }}
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
        {t("twoFactorPage.verify")}
        {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </Button>
    </Form>
  );
}
