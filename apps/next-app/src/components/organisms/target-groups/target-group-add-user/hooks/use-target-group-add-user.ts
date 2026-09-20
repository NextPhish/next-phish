"use client";

import { targetGroupUserSchema } from "@next-phish/shared";
import type { FormikHelpers } from "formik";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { validateTargetGroup } from "../../validation";

export interface AddUserValues {
  email: string;
  firstName: string;
  lastName: string;
  position: string;
}

export const initialAddUserValues: AddUserValues = {
  email: "",
  firstName: "",
  lastName: "",
  position: "",
};

export function useTargetGroupAddUser(
  targetGroupId: string,
  onHide: () => void,
) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, reset } = useFormStatus();
  const add = trpc.targetGroup.addUser.useMutation();

  return {
    error: status.type === "error" ? status.message : "",
    validate: (values: AddUserValues) =>
      validateTargetGroup(targetGroupUserSchema, values, t),
    onSubmit: async (
      values: AddUserValues,
      { resetForm }: FormikHelpers<AddUserValues>,
    ) => {
      reset();
      try {
        await add.mutateAsync({
          targetGroupId,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          position: values.position || undefined,
        });
        await utils.targetGroup.invalidate();
        resetForm();
        onHide();
      } catch {
        setError(t("targetGroups.addUserError"));
      }
    },
  };
}
