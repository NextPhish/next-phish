"use client";

import { useRouter } from "next/navigation";
import { createTargetGroupSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { validateTargetGroup } from "../../validation";
import type { TargetGroupFormValues } from "../types/form-values";
import type { TargetGroupFormOptions } from "../types/form-options";

export function useTargetGroupForm({
  mode = "create",
  groupId,
  initialName = "",
  initialStatus = "DRAFT",
  onSuccess,
}: TargetGroupFormOptions) {
  const t = useTranslation();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const create = trpc.targetGroup.create.useMutation();
  const update = trpc.targetGroup.update.useMutation();

  async function submit(values: TargetGroupFormValues) {
    reset();
    try {
      if (mode === "edit" && groupId) {
        await update.mutateAsync({
          id: groupId,
          name: values.name.trim(),
          status: values.status,
        });
        await utils.targetGroup.invalidate();
        onSuccess?.();
        setSuccess(t("targetGroups.updated"));
      } else {
        await create.mutateAsync({
          name: values.name.trim(),
          status: values.status,
          users: values.users.map(
            ({ email, firstName, lastName, position }) => ({
              email,
              firstName,
              lastName,
              position: position || undefined,
            }),
          ),
        });
        await utils.targetGroup.list.invalidate();
        onSuccess?.();
        if (!onSuccess) router.push("/target-groups");
      }
    } catch {
      setError(
        mode === "edit"
          ? t("targetGroups.updateError")
          : t("targetGroups.createError"),
      );
    }
  }

  return {
    initialValues: {
      name: initialName,
      status: initialStatus,
      users: [],
    } as TargetGroupFormValues,
    validate: (values: TargetGroupFormValues) =>
      validateTargetGroup(createTargetGroupSchema, values, t),
    submit,
    error: status.type === "error" ? status.message : "",
    success: status.type === "success" ? status.message : "",
    isEdit: mode === "edit",
    onCancel: onSuccess ? undefined : () => router.push("/target-groups"),
  };
}
