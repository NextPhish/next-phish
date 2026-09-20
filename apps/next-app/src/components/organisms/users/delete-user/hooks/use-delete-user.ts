"use client";

import { useState } from "react";
import type { UserView } from "@next-phish/backend";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";

export function useDeleteUser(user: UserView, onClose: () => void) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const [orphanAction, setOrphanAction] = useState<"keep" | "delete">("keep");
  const { status, setError } = useFormStatus();
  const preview = trpc.user.deletionPreview.useQuery({ userId: user.id });
  const remove = trpc.user.delete.useMutation();
  const currentPreview =
    preview.data?.userId === user.id ? preview.data : undefined;
  const canDelete = Boolean(
    currentPreview &&
    !preview.isLoading &&
    !preview.isFetching &&
    !preview.error &&
    !remove.isPending,
  );

  return {
    preview: currentPreview,
    previewLoading: preview.isLoading || preview.isFetching,
    previewError: Boolean(preview.error),
    onRetry: () => void preview.refetch(),
    orphanAction,
    onOrphanActionChange: setOrphanAction,
    canDelete,
    pending: remove.isPending,
    error: status.type === "error" ? status.message : "",
    onConfirm: async () => {
      if (!canDelete) return;
      try {
        await remove.mutateAsync({ userId: user.id, orphanAction });
        await utils.user.list.invalidate();
        onClose();
      } catch {
        setError(t("usersUi.deleteError"));
      }
    },
  };
}
