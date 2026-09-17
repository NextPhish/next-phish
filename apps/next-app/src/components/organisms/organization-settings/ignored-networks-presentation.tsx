"use client";

import { FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { IgnoredNetworkForm } from "./ignored-network-form";
import { IgnoredNetworkList } from "./ignored-network-list";
import { IgnoredNetworkDeleteDialog } from "./ignored-network-delete-dialog";
import type { IgnoredNetworksPresentationProps } from "./ignored-networks.types";
import styles from "./organization-settings.module.css";

export function IgnoredNetworksPresentation({
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
}: IgnoredNetworksPresentationProps) {
  const t = useTranslation();
  const pendingNetwork = networks.find(({ id }) => id === pendingDeleteId);

  return (
    <div>
      <div className={styles.networkHeader}>
        <h3>{title ?? t("organizations.ignoredNetworks")}</h3>
        <p>{hint ?? t("organizations.ignoredNetworksHint")}</p>
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
