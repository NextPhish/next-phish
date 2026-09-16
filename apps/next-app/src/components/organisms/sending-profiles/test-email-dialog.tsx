"use client";
import { Formik } from "formik";
import { z } from "zod";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { trpc } from "@/src/lib/trpc";
import { TestEmailPresentation } from "./test-email-presentation";

interface Props {
  profileId: string;
  visible: boolean;
  onHide: () => void;
}
const schema = z.object({ toEmail: z.string().trim().email() });
export function TestEmailDialog({ profileId, visible, onHide }: Props) {
  const t = useTranslation();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const send = trpc.mailSending.sendTest.useMutation();
  return (
    <Formik
      initialValues={{ toEmail: "" }}
      validate={(values) =>
        Object.fromEntries(
          Object.entries(toFormikValidation(schema)(values)).map(([key]) => [
            key,
            t("sendingProfiles.validation.testRecipientInvalid"),
          ]),
        )
      }
      onSubmit={async (values) => {
        reset();
        try {
          await send.mutateAsync({ profileId, toEmail: values.toEmail.trim() });
          setSuccess(t("sendingProfiles.testEmailSuccess"));
        } catch {
          setError(t("sendingProfiles.testEmailError"));
        }
      }}
    >
      {({ resetForm }) => (
        <TestEmailPresentation
          visible={visible}
          pending={send.isPending}
          status={status}
          onClose={() => {
            if (send.isPending) return;
            resetForm();
            reset();
            onHide();
          }}
        />
      )}
    </Formik>
  );
}
