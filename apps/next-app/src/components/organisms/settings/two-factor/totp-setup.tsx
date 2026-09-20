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
import type { TwoFactorValues } from "./parts/two-factor-settings-view";
import { BackupCodes } from "./backup-codes";

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
      className="grid gap-5"
      aria-busy={isSubmitting || undefined}
    >
      <div className="grid gap-[18px]">
        <div className="grid justify-items-center gap-3 rounded-[10px] border border-[var(--np-border)] bg-[var(--np-tint)] p-4 text-center [&_p]:mt-1 [&_p]:text-xs [&_p]:leading-6 [&_p]:text-[var(--np-muted)]">
          <p>{t("settings.scanQr")}</p>
          <span className="inline-flex rounded-lg bg-white p-3">
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
      <div className="flex justify-end gap-2.5">
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
