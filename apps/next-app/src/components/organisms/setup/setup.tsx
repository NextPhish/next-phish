"use client";

import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { authClient } from "@/src/lib/auth-client";
import { setupSchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { SetupView } from "./parts/setup-view";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

interface SetupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function Setup() {
  const t = useTranslation();
  const router = useRouter();
  const { status, setError, reset } = useFormStatus();

  async function handleSubmit(values: SetupValues) {
    reset();
    try {
      const { error: err } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (err) {
        setError(err.message || err.code || t("setup.failedToCreateAccount"));
        return;
      }

      router.push("/login?message=check-email");
    } catch {
      setError(t("setup.failedToCreateAccount"));
    }
  }

  return (
    <Formik<SetupValues>
      initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
      validate={toFormikValidation(setupSchema)}
      onSubmit={handleSubmit}
    >
      <SetupView error={status.type === "error" ? status.message : ""} />
    </Formik>
  );
}
