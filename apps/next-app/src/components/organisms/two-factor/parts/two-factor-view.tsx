"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import { ArrowRight } from "lucide-react";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import type { TwoFactorValues } from "../two-factor";

interface TwoFactorViewProps {
  error: string;
}

export function TwoFactorView({ error }: TwoFactorViewProps) {
  const t = useTranslation();
  const { errors, isSubmitting, touched } = useFormikContext<TwoFactorValues>();

  return (
    <Form className="grid gap-5" noValidate>
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
                className="text-center text-xl font-[650] tabular-nums tracking-[0.42em] indent-[0.42em]"
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
        className="mt-2 w-full"
      >
        {t("twoFactorPage.verify")}
        {!isSubmitting && <ArrowRight size={16} aria-hidden="true" />}
      </Button>
    </Form>
  );
}
