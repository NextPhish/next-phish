"use client";

import { z } from "zod";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { trpc } from "@/src/lib/trpc";

const schema = z.object({ toEmail: z.string().trim().email() });

export function useTestEmail(profileId: string) {
  const t = useTranslation();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const send = trpc.mailSending.sendTest.useMutation();
  return {
    status,
    pending: send.isPending,
    reset,
    validate: (values: { toEmail: string }) =>
      Object.fromEntries(
        Object.entries(toFormikValidation(schema)(values)).map(([key]) => [
          key,
          t("sendingProfiles.validation.testRecipientInvalid"),
        ]),
      ),
    submit: async (values: { toEmail: string }) => {
      reset();
      try {
        await send.mutateAsync({ profileId, toEmail: values.toEmail.trim() });
        setSuccess(t("sendingProfiles.testEmailSuccess"));
      } catch {
        setError(t("sendingProfiles.testEmailError"));
      }
    },
  };
}
