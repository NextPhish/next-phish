"use client";
import { Form, useFormikContext } from "formik";
import { Button, Dialog, FormField, FormMessage, Input } from "@next-phish/ui";
import type { FormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

export function TestEmailPresentation({
  visible,
  pending,
  status,
  onClose,
}: {
  visible: boolean;
  pending: boolean;
  status: FormStatus;
  onClose: () => void;
}) {
  const t = useTranslation();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur } =
    useFormikContext<{ toEmail: string }>();
  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      dismissible={!pending}
      title={t("sendingProfiles.testEmailLabel")}
      description={t("sendingProfiles.testEmailDescription")}
      closeLabel={t("common.cancel")}
      footer={
        <>
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="sending-test-form"
            loading={pending || isSubmitting}
            disabled={!values.toEmail.trim()}
          >
            {pending
              ? t("sendingProfiles.testEmailSending")
              : t("sendingProfiles.testEmailSend")}
          </Button>
        </>
      }
    >
      <Form id="sending-test-form" noValidate>
        <FormField
          id="sending-test-recipient"
          label={t("sendingProfiles.testEmailRecipient")}
          error={touched.toEmail ? errors.toEmail : undefined}
          required
        >
          {(control) => (
            <Input
              {...control}
              type="email"
              name="toEmail"
              value={values.toEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("sendingProfiles.testEmailPlaceholder")}
            />
          )}
        </FormField>
        {status.type === "error" && (
          <FormMessage variant="error">{status.message}</FormMessage>
        )}
        {status.type === "success" && (
          <FormMessage variant="success">{status.message}</FormMessage>
        )}
      </Form>
    </Dialog>
  );
}
