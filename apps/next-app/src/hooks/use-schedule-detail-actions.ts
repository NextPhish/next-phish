"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";

export function useScheduleDetailActions(id: string) {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cancel = trpc.campaign.cancelSchedule.useMutation({
    onSuccess: async () => {
      await utils.campaign.getSchedule.invalidate({ id });
      setSuccess(t("scheduleUi.cancelSuccess"));
    },
    onError: () => setError(t("scheduleUi.actionFailed")),
  });
  const duplicate = trpc.campaign.duplicateSchedule.useMutation({
    onSuccess: (result) =>
      router.push(`/schedule/${result.schedule.id}?saved=duplicated`),
    onError: () => setError(t("scheduleUi.actionFailed")),
  });
  const activate = trpc.campaign.activateSchedule.useMutation({
    onSuccess: async () => {
      await utils.campaign.getSchedule.invalidate({ id });
      setSuccess(t("scheduleUi.activateSuccess"));
    },
    onError: () => setError(t("scheduleUi.actionFailed")),
  });
  const deleteSchedule = trpc.campaign.deleteSchedule.useMutation({
    onSuccess: async () => {
      await utils.campaign.listSchedules.invalidate();
      router.push("/schedule");
    },
    onError: () => {
      setDeleteOpen(false);
      setError(t("scheduleUi.deleteFailed"));
    },
  });

  return {
    status,
    reset,
    deleteOpen,
    setDeleteOpen,
    cancel,
    duplicate,
    activate,
    deleteSchedule,
  };
}
