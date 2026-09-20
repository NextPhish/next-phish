"use client";

import { Formik } from "formik";
import { useState } from "react";
import {
  ignoredNetworkSchema,
  type IgnoredNetworkInput,
} from "@next-phish/shared";
import { GlobalIgnoredNetworksView } from "./parts/global-ignored-networks-view";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { localizedZodValidation } from "../../organization-settings/validation";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n";

export function GlobalIgnoredNetworks() {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const [pendingDeleteId, setPendingDeleteId] = useState<string>();
  const {
    data: networks = [],
    isLoading,
    error: networksError,
    refetch,
  } = trpc.settings.listIgnoredNetworks.useQuery();
  const create = trpc.settings.createIgnoredNetwork.useMutation();
  const remove = trpc.settings.deleteIgnoredNetwork.useMutation();

  async function refresh() {
    await utils.settings.listIgnoredNetworks.invalidate();
  }

  async function handleSubmit(
    values: IgnoredNetworkInput,
    helpers: { resetForm: () => void },
  ) {
    reset();
    try {
      await create.mutateAsync({
        network: values.network,
        description: values.description || undefined,
      });
      helpers.resetForm();
      await refresh();
      setSuccess(t("settings.globalIgnoredNetworkAdded"));
    } catch {
      setError(t("settings.globalIgnoredNetworkError"));
    }
  }

  async function handleDelete(id: string) {
    reset();
    try {
      await remove.mutateAsync({ id });
      await refresh();
      setSuccess(t("settings.globalIgnoredNetworkRemoved"));
      setPendingDeleteId(undefined);
    } catch {
      setError(t("settings.globalIgnoredNetworkDeleteError"));
    }
  }

  return (
    <Formik<IgnoredNetworkInput>
      initialValues={{ network: "", description: "" }}
      validate={localizedZodValidation(ignoredNetworkSchema, t)}
      onSubmit={handleSubmit}
    >
      <GlobalIgnoredNetworksView
        networks={networks}
        title={t("settings.globalIgnoredNetworks")}
        hint={t("settings.globalIgnoredNetworksHint")}
        isLoading={isLoading}
        loadError={
          networksError ? t("settings.globalIgnoredNetworkLoadError") : ""
        }
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
