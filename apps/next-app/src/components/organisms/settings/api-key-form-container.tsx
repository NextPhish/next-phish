"use client";
import { Formik } from "formik";
import {
  createApiKeyFormSchema,
  type CreateApiKeyFormValues,
} from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { ApiKeyForm } from "./api-key-form";
interface Props {
  visible: boolean;
  onHide: () => void;
  onCreated: (key: string) => void;
}
export function ApiKeyFormContainer({ visible, onHide, onCreated }: Props) {
  const t = useTranslation();
  const { status, setError, reset } = useFormStatus();
  const {
    data: orgData,
    isLoading,
    error: orgError,
  } = trpc.organization.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: visible },
  );
  const createMutation = trpc.apiKey.create.useMutation();
  async function handleSubmit(values: CreateApiKeyFormValues) {
    reset();
    const permissions: Record<string, string[]> = {};
    for (const [scope, enabled] of Object.entries(values.permissions)) {
      if (enabled) {
        const [action, resource] = scope.split(":");
        (permissions[resource] ??= []).push(action);
      }
    }
    try {
      const data = await createMutation.mutateAsync({
        name: values.name || undefined,
        organizationIds: values.limitToOrganizations
          ? values.organizationIds
          : undefined,
        expiresInDays: values.expiresInDays ?? undefined,
        permissions: Object.keys(permissions).length ? permissions : undefined,
        rateLimitEnabled: values.rateLimitEnabled,
        rateLimitMax: values.rateLimitEnabled
          ? (values.rateLimitMax ?? undefined)
          : undefined,
        rateLimitTimeWindow: values.rateLimitEnabled
          ? (values.rateLimitTimeWindow ?? undefined)
          : undefined,
      });
      const result = data as { key?: string } | null;
      if (result?.key) onCreated(result.key);
      else setError(t("apiKeys.createError"));
    } catch {
      setError(t("apiKeys.createError"));
    }
  }
  return (
    <Formik<CreateApiKeyFormValues>
      initialValues={{
        name: "",
        limitToOrganizations: false,
        organizationIds: [],
        permissions: {},
        expiresInDays: 90,
        rateLimitEnabled: true,
        rateLimitMax: 1000,
        rateLimitTimeWindow: 3600000,
      }}
      validate={toFormikValidation(createApiKeyFormSchema)}
      onSubmit={handleSubmit}
    >
      <ApiKeyForm
        visible={visible}
        onHide={onHide}
        error={status.type === "error" ? status.message : ""}
        organizations={orgData?.organizations ?? []}
        organizationsLoading={isLoading}
        organizationsError={!!orgError}
      />
    </Formik>
  );
}
