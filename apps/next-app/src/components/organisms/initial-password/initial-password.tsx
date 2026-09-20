"use client";

import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { z } from "zod";
import { trpc } from "@/src/lib/trpc";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { InitialPasswordView } from "./parts/initial-password-view";

type Values = {
  password: string;
  confirmPassword: string;
};

export function InitialPassword() {
  const router = useRouter();
  const t = useTranslation();
  const mutation = trpc.user.setInitialPassword.useMutation();
  const { status, setError } = useFormStatus();
  const schema = z
    .object({
      password: z
        .string()
        .min(8, t("initialPassword.validation.passwordTooShort")),
      confirmPassword: z
        .string()
        .min(8, t("initialPassword.validation.confirmRequired")),
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: t("initialPassword.validation.passwordMismatch"),
    });

  async function submit(values: Values) {
    setError("");
    try {
      await mutation.mutateAsync(values);
      router.push("/");
      router.refresh();
    } catch {
      setError(t("initialPassword.submitError"));
    }
  }

  return (
    <Formik<Values>
      initialValues={{ password: "", confirmPassword: "" }}
      validate={toFormikValidation(schema)}
      onSubmit={submit}
    >
      <InitialPasswordView
        error={status.type === "error" ? status.message : ""}
      />
    </Formik>
  );
}
