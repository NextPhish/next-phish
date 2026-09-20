"use client";

import { Formik, type FormikHelpers } from "formik";

import { authClient } from "@/src/lib/auth-client";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { passwordValidator } from "../validation";
import {
  ChangePasswordFields,
  type PasswordValues,
} from "./parts/change-password-fields";

export function ChangePassword() {
  const t = useTranslation();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const validate = passwordValidator(t);

  async function handleSubmit(
    values: PasswordValues,
    helpers: FormikHelpers<PasswordValues>,
  ) {
    reset();
    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        setError(t("settings.failedToChangePassword"));
        return;
      }
      helpers.resetForm();
      setSuccess(t("settings.passwordChanged"));
    } catch {
      setError(t("settings.unexpectedPasswordError"));
    }
  }

  return (
    <Formik<PasswordValues>
      initialValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      <ChangePasswordFields
        error={status.type === "error" ? status.message : ""}
        success={status.type === "success" ? status.message : ""}
      />
    </Formik>
  );
}
