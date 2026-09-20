"use client";

import {
  adminCreateUserSchema,
  type AdminCreateUserInput,
} from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { validateCreateUser } from "../validation";

export const initialCreateUserValues: AdminCreateUserInput = {
  name: "",
  email: "",
  role: "user",
  organizationMode: "self",
  organizationId: undefined,
};

export function useCreateUser(onCreated: () => void) {
  const utils = trpc.useUtils();
  const create = trpc.user.create.useMutation();
  const organizations = trpc.user.listOrganizations.useQuery();
  const { status, setError, reset } = useFormStatus();
  const t = useTranslation();

  return {
    organizations: organizations.data ?? [],
    organizationsLoading: organizations.isLoading,
    error: status.type === "error" ? status.message : "",
    validate: (values: AdminCreateUserInput) =>
      validateCreateUser(adminCreateUserSchema, values, t),
    submit: async (values: AdminCreateUserInput) => {
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
    },
  };
}
