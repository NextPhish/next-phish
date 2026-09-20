"use client";

import { Formik } from "formik";
import {
  ignoredNetworkSchema,
  type IgnoredNetworkInput,
} from "@next-phish/shared";
import { useState } from "react";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n";
import { IgnoredNetworksView } from "./parts/ignored-networks-view";
import { localizedZodValidation } from "../validation";

interface IgnoredNetworksProps {
  organizationId: string;
}

export function IgnoredNetworks({ organizationId }: IgnoredNetworksProps) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const [pendingDeleteId, setPendingDeleteId] = useState<string>();
  const {
    data: networks = [],
    isLoading,
    error: networksError,
    refetch,
  } = trpc.organization.listIgnoredNetworks.useQuery({ organizationId });

  const create = trpc.organization.createIgnoredNetwork.useMutation();
  const remove = trpc.organization.deleteIgnoredNetwork.useMutation();

  async function refresh() {
    await utils.organization.listIgnoredNetworks.invalidate({ organizationId });
  }

  async function handleSubmit(
    values: IgnoredNetworkInput,
    helpers: { resetForm: () => void },
  ) {
    reset();
    try {
      await create.mutateAsync({
        organizationId,
        network: values.network,
        description: values.description || undefined,
      });
      helpers.resetForm();
      await refresh();
      setSuccess(t("organizations.ignoredNetworkAdded"));
    } catch {
      setError(t("organizations.ignoredNetworkError"));
    }
  }

  async function handleDelete(id: string) {
    reset();
    try {
      await remove.mutateAsync({ organizationId, id });
      await refresh();
      setSuccess(t("organizations.ignoredNetworkRemoved"));
      setPendingDeleteId(undefined);
    } catch {
      setError(t("organizations.ignoredNetworkDeleteError"));
    }
  }

  return (
    <Formik<IgnoredNetworkInput>
      initialValues={{ network: "", description: "" }}
      validate={localizedZodValidation(ignoredNetworkSchema, t)}
      onSubmit={handleSubmit}
    >
      <IgnoredNetworksView
        networks={networks}
        isLoading={isLoading}
        loadError={networksError ? t("organizationUi.networkLoadError") : ""}
        deletingId={remove.isPending ? remove.variables?.id : undefined}
        pendingDeleteId={pendingDeleteId}
        status={status}
        onDelete={handleDelete}
        onRequestDelete={(id) => {
          reset();
          setPendingDeleteId(id);
        }}
        onCancelDelete={() => setPendingDeleteId(undefined)}
        onRetry={() => void refetch()}
      />
    </Formik>
  );
}
