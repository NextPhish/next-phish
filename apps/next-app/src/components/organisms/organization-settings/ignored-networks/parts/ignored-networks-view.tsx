"use client";

import { FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { IgnoredNetworkForm } from "./ignored-network-form";
import { IgnoredNetworkList } from "./ignored-network-list";
import { IgnoredNetworkDeleteDialog } from "./ignored-network-delete-dialog";
import type { IgnoredNetworksViewProps } from "../types/ignored-networks.types";

export function IgnoredNetworksView({
  networks,
  title,
  hint,
  isLoading,
  loadError,
  deletingId,
  pendingDeleteId,
  status,
  onDelete,
  onRequestDelete,
  onCancelDelete,
  onRetry = () => undefined,
}: IgnoredNetworksViewProps) {
  const t = useTranslation();
  const pendingNetwork = networks.find(({ id }) => id === pendingDeleteId);

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[17px] font-[650]">
          {title ?? t("organizations.ignoredNetworks")}
        </h3>
        <p className="mt-[5px] max-w-[720px] text-[13px] leading-[1.55] text-[var(--np-muted)]">
          {hint ?? t("organizations.ignoredNetworksHint")}
        </p>
      </div>

      <IgnoredNetworkForm />

      {status.type === "error" && !pendingNetwork && (
        <FormMessage variant="error">{status.message}</FormMessage>
      )}
      {status.type === "success" && (
        <FormMessage variant="success">{status.message}</FormMessage>
      )}

      <IgnoredNetworkList
        networks={networks}
        isLoading={isLoading}
        loadError={loadError}
        deletingId={deletingId}
        onRequestDelete={onRequestDelete}
        onRetry={onRetry}
      />
      <IgnoredNetworkDeleteDialog
        pendingNetwork={pendingNetwork}
        deletingId={deletingId}
        status={status}
        onDelete={onDelete}
        onCancelDelete={onCancelDelete}
      />
    </div>
  );
}
