"use client";

import { Formik } from "formik";
import { adminCreateUserSchema } from "@next-phish/shared";
import type { AdminCreateUserInput } from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { CreateUserPresentation } from "./create-user-presentation";
import { validateCreateUser } from "./users-validation";

export function CreateUserContainer({
  visible,
  onCreated,
  onCancel,
}: {
  visible: boolean;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const create = trpc.user.create.useMutation();
  const organizations = trpc.user.listOrganizations.useQuery();
  const { status, setError, reset } = useFormStatus();
  const t = useTranslation();

  async function submit(values: AdminCreateUserInput) {
    reset();
    try {
      await create.mutateAsync({
        ...values,
        organizationId:
          values.organizationMode === "existing"
            ? values.organizationId
            : undefined,
      });
      await utils.user.list.invalidate();
      onCreated();
    } catch {
      setError(t("usersUi.createError"));
    }
  }

  return (
    <Formik<AdminCreateUserInput>
      initialValues={{
        name: "",
        email: "",
        role: "user",
        organizationMode: "self",
        organizationId: undefined,
      }}
      validate={(values) =>
        validateCreateUser(adminCreateUserSchema, values, t)
      }
      onSubmit={submit}
    >
      <CreateUserPresentation
        organizations={organizations.data ?? []}
        organizationsLoading={organizations.isLoading}
        visible={visible}
        error={status.type === "error" ? status.message : ""}
        onCancel={onCancel}
      />
    </Formik>
  );
}
