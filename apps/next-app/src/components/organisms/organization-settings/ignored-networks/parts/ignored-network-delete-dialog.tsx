import { Button, Dialog, DialogClose, FormMessage } from "@next-phish/ui";
import type { FormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import type { IgnoredNetwork } from "../types/ignored-networks.types";

interface IgnoredNetworkDeleteDialogProps {
  pendingNetwork?: IgnoredNetwork;
  deletingId?: string;
  status: FormStatus;
  onDelete: (id: string) => Promise<void>;
  onCancelDelete: () => void;
}

export function IgnoredNetworkDeleteDialog({
  pendingNetwork,
  deletingId,
  status,
  onDelete,
  onCancelDelete,
}: IgnoredNetworkDeleteDialogProps) {
  const t = useTranslation();

  return (
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
        <code className="font-[650]">{pendingNetwork.normalizedNetwork}</code>
      )}
    </Dialog>
  );
}
