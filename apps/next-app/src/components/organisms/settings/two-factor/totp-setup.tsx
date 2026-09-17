"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import QRCode from "react-qr-code";
import {
  Button,
  DialogClose,
  FormField,
  FormMessage,
  Input,
} from "@next-phish/ui";
import { useTranslation } from "../../../../lib/i18n";
import type { TwoFactorValues } from "./presentation";
import { BackupCodes } from "./backup-codes";
import styles from "../profile-settings.module.css";

export function TotpSetup({
  totpUri,
  backupCodes,
  error,
  onCancel,
}: {
  totpUri: string;
  backupCodes: string[];
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
      <div className={styles.setupGrid}>
        <div className={styles.qrPanel}>
          <p>{t("settings.scanQr")}</p>
          <span className={styles.qrCode}>
            <QRCode value={totpUri} size={176} />
          </span>
        </div>
        {backupCodes.length > 0 && <BackupCodes codes={backupCodes} />}
      </div>
      <FormField
        id="two-factor-code"
        label={t("settings.verificationCode")}
        hint={t("settings.verificationCodeHint")}
        error={touched.verifyCode ? errors.verifyCode : undefined}
        required
      >
        {(control) => (
          <Field name="verifyCode">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...control}
                {...field}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                disabled={isSubmitting}
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
          {t("settings.verifyActivate")}
        </Button>
      </div>
    </Form>
  );
}
