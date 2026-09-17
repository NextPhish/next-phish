"use client";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { createTargetGroupSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import {
  TargetGroupFormPresentation,
  type TargetGroupFormValues,
} from "./target-group-form-presentation";
import { validateTargetGroup } from "./target-group-validation";
interface Props {
  mode?: "create" | "edit";
  groupId?: string;
  initialName?: string;
  initialStatus?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  onSuccess?: () => void;
}
export function TargetGroupForm({
  mode = "create",
  groupId,
  initialName = "",
  initialStatus = "DRAFT",
  onSuccess,
}: Props) {
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
  return (
    <Formik<TargetGroupFormValues>
      initialValues={{ name: initialName, status: initialStatus, users: [] }}
      validate={(values) =>
        validateTargetGroup(createTargetGroupSchema, values, t)
      }
      onSubmit={submit}
      enableReinitialize
    >
      <TargetGroupFormPresentation
        error={status.type === "error" ? status.message : ""}
        success={status.type === "success" ? status.message : ""}
        isEdit={mode === "edit"}
        onCancel={onSuccess ? undefined : () => router.push("/target-groups")}
      />
    </Formik>
  );
}
