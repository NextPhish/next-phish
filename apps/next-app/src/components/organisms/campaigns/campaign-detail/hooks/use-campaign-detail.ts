"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { statusLabel, statusSeverity } from "../parts/detail-format";

export function useCampaignDetail(id: string, saved?: string) {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status: actionStatus, setError, setSuccess, reset } = useFormStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const query = trpc.campaign.getById.useQuery({ id });
  const invalidate = () =>
    Promise.all([
      utils.campaign.getById.invalidate({ id }),
      utils.campaign.list.invalidate(),
    ]);
  const mutationOptions = (message: string) => ({
    onSuccess: async () => {
      await invalidate();
      setSuccess(message);
    },
    onError: () => setError(t("campaignsUi.actionError")),
  });
  const publish = trpc.campaign.publish.useMutation(
    mutationOptions(t("campaignsUi.publishedSuccess")),
  );
  const pause = trpc.campaign.pause.useMutation(
    mutationOptions(t("campaignsUi.pausedSuccess")),
  );
  const resume = trpc.campaign.resume.useMutation(
    mutationOptions(t("campaignsUi.resumedSuccess")),
  );
  const complete = trpc.campaign.complete.useMutation(
    mutationOptions(t("campaignsUi.completedSuccess")),
  );
  const deleteCampaign = trpc.campaign.delete.useMutation({
    onSuccess: async () => {
      await utils.campaign.list.invalidate();
      router.push("/campaigns");
    },
    onError: () => setError(t("campaignsUi.deleteError")),
  });
  const clone = trpc.campaign.clone.useMutation({
    onSuccess: (copy) => router.push(`/campaigns/${copy.id}?saved=cloned`),
    onError: () => setError(t("campaignsUi.cloneError")),
  });
  const data = query.data;
  const savedMessage =
    saved === "created"
      ? t("campaignsUi.createdSuccess")
      : saved === "updated"
        ? t("campaignsUi.updatedSuccess")
        : saved === "cloned"
          ? t("campaignsUi.clonedSuccess")
          : "";
  const schedules = data
    ? [
        ...(data.schedule ? [data.schedule] : []),
        ...data.scheduleSources.map((source) => source.schedule),
      ].filter(
        (schedule, index, all) =>
          all.findIndex((candidate) => candidate.id === schedule.id) === index,
      )
    : [];
  return {
    t,
    data,
    isLoading: query.isLoading,
    savedMessage,
    schedules,
    recipientCount: data?.targetGroup?._count.users ?? 0,
    statusLabel: data ? statusLabel(data.status, t) : "",
    statusTone: data ? statusSeverity(data.status) : ("neutral" as const),
    actionStatus,
    pending: {
      publish: publish.isPending,
      pause: pause.isPending,
      resume: resume.isPending,
      complete: complete.isPending,
      clone: clone.isPending,
      delete: deleteCampaign.isPending,
    },
    deleteOpen,
    onDeleteOpenChange: (open: boolean) => {
      reset();
      setDeleteOpen(open);
    },
    onEdit: () => router.push(`/campaigns/${id}/edit`),
    onSchedule: () => router.push(`/schedule/new?campaignId=${id}`),
    onNavigate: (path: string) => router.push(path),
    onAction: (
      action: "publish" | "pause" | "resume" | "complete" | "clone",
    ) => {
      reset();
      if (action === "publish") publish.mutate({ id });
      if (action === "pause") pause.mutate({ id });
      if (action === "resume") resume.mutate({ id });
      if (action === "complete") complete.mutate({ id });
      if (action === "clone" && data)
        clone.mutate({
          id,
          name: `${data.name} ${t("campaignsUi.copySuffix")}`,
          type: data.type,
          targetGroupId: data.type === "CONCRETE" ? data.targetGroupId : null,
        });
    },
    onDelete: () => {
      reset();
      deleteCampaign.mutate({ id });
    },
  };
}
