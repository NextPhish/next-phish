"use client";
import { Formik } from "formik";
import { targetGroupUserSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { AddUserPresentation } from "./add-user-presentation";
import { validateTargetGroup } from "./target-group-validation";
interface Props {
  visible: boolean;
  onHide: () => void;
  targetGroupId: string;
}
export function AddUserDialog({ visible, onHide, targetGroupId }: Props) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, reset } = useFormStatus();
  const add = trpc.targetGroup.addUser.useMutation();
  return (
    <Formik
      initialValues={{ email: "", firstName: "", lastName: "", position: "" }}
      validate={(values) =>
        validateTargetGroup(targetGroupUserSchema, values, t)
      }
      onSubmit={async (values, { resetForm }) => {
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
      }}
    >
      <AddUserPresentation
        visible={visible}
        onHide={onHide}
        error={status.type === "error" ? status.message : ""}
      />
    </Formik>
  );
}
