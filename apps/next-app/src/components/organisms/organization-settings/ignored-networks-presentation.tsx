"use client";

import { Field, Form, useFormikContext } from "formik";
import {
  Button,
  Dialog,
  DialogClose,
  FormField,
  FormMessage,
  Input,
  Skeleton,
} from "@next-phish/ui";
import { Plus, Trash2 } from "lucide-react";
import type { IgnoredNetworkInput } from "@next-phish/shared";
import type { FormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./organization-settings.module.css";

interface IgnoredNetwork {
  id: string;
  network: string;
  normalizedNetwork: string;
  description: string | null;
  createdAt: Date;
}

interface IgnoredNetworksPresentationProps {
  networks: IgnoredNetwork[];
  title?: string;
  hint?: string;
  isLoading: boolean;
  loadError?: string;
  deletingId?: string;
  pendingDeleteId?: string;
  status: FormStatus;
  onDelete: (id: string) => Promise<void>;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onRetry?: () => void;
}

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
  const { isSubmitting, errors, touched } =
    useFormikContext<IgnoredNetworkInput>();
  const pendingNetwork = networks.find(({ id }) => id === pendingDeleteId);

  return (
    <div>
      <div className={styles.networkHeader}>
        <h3>{title ?? t("organizations.ignoredNetworks")}</h3>
        <p>{hint ?? t("organizations.ignoredNetworksHint")}</p>
      </div>

      <Form className={styles.networkForm} noValidate>
        <FormField
          id="ignored-network"
          label={t("organizations.ipOrNetwork")}
          required
          error={touched.network ? errors.network : undefined}
        >
          {(control) => (
            <Field
              as={Input}
              name="network"
              placeholder="192.0.2.10 or 10.0.0.0/8"
              {...control}
            />
          )}
        </FormField>
        <FormField
          id="ignored-network-description"
          label={t("organizations.description")}
          error={touched.description ? errors.description : undefined}
        >
          {(control) => (
            <Field
              as={Input}
              name="description"
              placeholder={t("organizations.descriptionPlaceholder")}
              {...control}
            />
          )}
        </FormField>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className={styles.networkAction}
        >
          <Plus size={16} aria-hidden="true" />
          {t("organizations.addIgnoredNetwork")}
        </Button>
      </Form>

      {status.type === "error" && !pendingNetwork && (
        <FormMessage variant="error">{status.message}</FormMessage>
      )}
      {status.type === "success" && (
        <FormMessage variant="success">{status.message}</FormMessage>
      )}

      <div className={styles.networkList}>
        {isLoading ? (
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
        ) : loadError ? (
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
        ) : networks.length === 0 ? (
          <div className={styles.empty}>
            {t("organizations.noIgnoredNetworks")}
          </div>
        ) : (
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
                      date: new Date(network.createdAt)
                        .toISOString()
                        .slice(0, 10),
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
        )}
      </div>

      <Dialog
        open={Boolean(pendingNetwork)}
        onOpenChange={(open) => !open && onCancelDelete()}
        title={t("organizations.removeIgnoredNetworkTitle")}
        description={
          pendingNetwork
            ? t("organizations.removeIgnoredNetworkConfirm", {
                network: pendingNetwork.normalizedNetwork,
              })
            : t("organizations.removeIgnoredNetworkTitle")
        }
        closeLabel={t("organizationUi.closeDialog")}
        dismissible={!deletingId}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary" disabled={Boolean(deletingId)}>
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              loading={Boolean(
                pendingNetwork && deletingId === pendingNetwork.id,
              )}
              onClick={() => pendingNetwork && void onDelete(pendingNetwork.id)}
            >
              {t("organizations.remove")}
            </Button>
          </>
        }
      >
        {status.type === "error" && (
          <FormMessage variant="error">{status.message}</FormMessage>
        )}
        {pendingNetwork && (
          <code className={styles.dialogNetwork}>
            {pendingNetwork.normalizedNetwork}
          </code>
        )}
      </Dialog>
    </div>
  );
}
