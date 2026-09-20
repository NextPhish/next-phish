"use client";

import { Button, Dialog, DialogClose } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";

export function ScheduleDeleteDialog({
  open,
  loading,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const t = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("scheduleUi.deleteTitle")}
      description={t("scheduleUi.deleteDescription")}
      closeLabel={t("settings.closeDialog")}
      dismissible={!loading}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="secondary" disabled={loading}>
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {t("scheduleUi.confirmDelete")}
          </Button>
        </>
      }
    >
      <p>{t("scheduleUi.deleteImpact")}</p>
    </Dialog>
  );
}
