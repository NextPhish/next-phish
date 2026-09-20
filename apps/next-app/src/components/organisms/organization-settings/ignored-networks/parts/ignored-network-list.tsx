import { Button, FormMessage, Skeleton } from "@next-phish/ui";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/src/lib/i18n";
import type { IgnoredNetwork } from "../types/ignored-networks.types";

const listClassName =
  "mt-5 overflow-hidden rounded-[var(--np-radius)] border border-[var(--np-border)] bg-[var(--np-surface)]";

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
      <div className={listClassName}>
        <div
          className="grid gap-px bg-[var(--np-border)]"
          role="status"
          aria-label={t("common.loading")}
        >
          {["one", "two", "three"].map((key) => (
            <div
              className="bg-[var(--np-surface)] px-5 py-[18px] [&>div:first-child]:h-3.5 [&>div:first-child]:w-[38%] [&>div:last-child]:mt-[9px] [&>div:last-child]:h-[11px] [&>div:last-child]:w-[62%]"
              key={key}
            >
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
      <div className={listClassName}>
        <div className="px-5 py-8 text-center text-[13px] text-[var(--np-muted)]">
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
      <div className={listClassName}>
        <div className="px-5 py-8 text-center text-[13px] text-[var(--np-muted)]">
          {t("organizations.noIgnoredNetworks")}
        </div>
      </div>
    );
  }

  return (
    <div className={listClassName}>
      <ul>
        {networks.map((network) => (
          <li
            key={network.id}
            className="flex items-center justify-between gap-5 border-b border-[var(--np-border)] px-5 py-[17px] last:border-b-0 max-[760px]:flex-col max-[760px]:items-start"
          >
            <div>
              <code className="text-[13px] font-[650] text-[var(--np-primary)]">
                {network.normalizedNetwork}
              </code>
              {network.description && (
                <p className="mt-1 text-[13px] text-[var(--np-text)]">
                  {network.description}
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--np-muted)]">
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
