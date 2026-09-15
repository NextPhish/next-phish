"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import {
  Button,
  DialogClose,
  FormField,
  FormMessage,
  PasswordInput,
} from "@next-phish/ui";
import { useTranslation } from "../../../../lib/i18n";
import type { TwoFactorValues } from "./presentation";
import styles from "../profile-settings.module.css";

export function PasswordPrompt({
  error,
  onCancel,
}: {
  error: string;
  onCancel: () => void;
}) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } = useFormikContext<TwoFactorValues>();
  return (
    <Form
      noValidate
      className={styles.dialogForm}
      aria-busy={isSubmitting || undefined}
    >
      <FormField
        id="two-factor-password"
        label={t("common.password")}
        error={touched.password ? errors.password : undefined}
        required
      >
        {(control) => (
          <Field name="password">
            {({ field }: { field: FieldInputProps<string> }) => (
              <PasswordInput
                {...control}
                {...field}
                autoComplete="current-password"
                autoFocus
                disabled={isSubmitting}
                placeholder={t("settings.enterCurrentPassword")}
                showLabel={t("settings.showPassword")}
                hideLabel={t("settings.hidePassword")}
              />
            )}
          </Field>
        )}
      </FormField>
      {error && <FormMessage variant="error">{error}</FormMessage>}
      <div className={styles.dialogActions}>
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" loading={isSubmitting}>
          {t("settings.continue")}
        </Button>
      </div>
    </Form>
  );
}
