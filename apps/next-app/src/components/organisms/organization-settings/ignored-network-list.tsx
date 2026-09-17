import { Button, FormMessage, Skeleton } from "@next-phish/ui";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/src/lib/i18n";
import type { IgnoredNetwork } from "./ignored-networks.types";
import styles from "./organization-settings.module.css";

interface IgnoredNetworkListProps {
  networks: IgnoredNetwork[];
  isLoading: boolean;
  loadError?: string;
  deletingId?: string;
  onRequestDelete: (id: string) => void;
  onRetry: () => void;
}

export function IgnoredNetworkList({
  networks,
  isLoading,
  loadError,
  deletingId,
  onRequestDelete,
  onRetry,
}: IgnoredNetworkListProps) {
  const t = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.networkList}>
        <div
          className={styles.skeletons}
          role="status"
          aria-label={t("common.loading")}
        >
          {["one", "two", "three"].map((key) => (
            <div className={styles.skeletonRow} key={key}>
              <Skeleton />
              <Skeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.networkList}>
        <div className={styles.empty}>
          <FormMessage
            variant="error"
            action={
              <Button size="sm" variant="secondary" onClick={onRetry}>
                {t("tableUi.retry")}
              </Button>
            }
          >
            {loadError}
          </FormMessage>
        </div>
      </div>
    );
  }

  if (networks.length === 0) {
    return (
      <div className={styles.networkList}>
        <div className={styles.empty}>
          {t("organizations.noIgnoredNetworks")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.networkList}>
      <ul>
        {networks.map((network) => (
          <li key={network.id} className={styles.networkRow}>
            <div>
              <code className={styles.networkValue}>
                {network.normalizedNetwork}
              </code>
              {network.description && (
                <p className={styles.networkDescription}>
                  {network.description}
                </p>
              )}
              <p className={styles.networkDate}>
                {t("organizations.addedOn", {
                  date: new Date(network.createdAt).toISOString().slice(0, 10),
                })}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="danger"
              loading={deletingId === network.id}
              disabled={Boolean(deletingId)}
              onClick={() => onRequestDelete(network.id)}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t("organizations.remove")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
