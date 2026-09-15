"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Pencil,
  Play,
  Trash2,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  FormMessage,
  PageHeader,
} from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { ScheduleDeleteDialog } from "./schedule-delete-dialog";
import { ScheduleDetailContent } from "./schedule-detail-content";
import { ScheduleDetailSkeleton } from "./schedule-detail-skeleton";
import styles from "./schedule-detail.module.css";

function statusTone(status: string) {
  if (status === "CANCELLED" || status === "BROKEN") return "danger" as const;
  if (status === "COMPLETED") return "success" as const;
  if (status === "RUNNING" || status === "SCHEDULED") return "info" as const;
  return "neutral" as const;
}

export function ScheduleDetailContainer({
  id,
  saved,
}: {
  id: string;
  saved?: string;
}) {
  const router = useRouter();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data, isLoading, error, refetch } =
    trpc.campaign.getSchedule.useQuery({ id });

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

  if (isLoading)
    return <ScheduleDetailSkeleton label={t("scheduleUi.loadingDetail")} />;
  if (error || !data) {
    return (
      <div className={styles.state}>
        <EmptyState
          icon={<AlertTriangle size={24} />}
          title={error ? t("scheduleUi.loadFailed") : t("scheduleUi.notFound")}
          description={error ? t("scheduleUi.loadFailedHint") : undefined}
          action={
            error ? (
              <Button variant="secondary" onClick={() => void refetch()}>
                {t("tableUi.retry")}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const canEdit = !["COMPLETED", "CANCELLED"].includes(data.status);
  const savedMessage =
    saved === "created"
      ? t("scheduleUi.createdSuccess")
      : saved === "updated"
        ? t("scheduleUi.updatedSuccess")
        : saved === "duplicated"
          ? t("scheduleUi.duplicateSuccess")
          : "";

  return (
    <section className={styles.root}>
      <PageHeader
        title={data.name}
        description={`${t(`scheduleUi.values.${data.type}`)} · ${data.targetTimezone}`}
        actions={
          <>
            <Badge tone={statusTone(data.status)}>
              {t(`scheduleUi.values.${data.status}`)}
            </Badge>
            {canEdit && (
              <Button onClick={() => router.push(`/schedule/${id}/edit`)}>
                <Pencil size={16} aria-hidden="true" />
                {t("scheduleUi.edit")}
              </Button>
            )}
          </>
        }
      />
      <div className={styles.actionBar}>
        {data.status === "DRAFT" && (
          <Button
            loading={activate.isPending}
            onClick={() => {
              reset();
              activate.mutate({ id });
            }}
          >
            <Play size={16} aria-hidden="true" />
            {t("scheduleUi.activate")}
          </Button>
        )}
        <Button
          variant="secondary"
          loading={duplicate.isPending}
          onClick={() => {
            reset();
            duplicate.mutate({ id });
          }}
        >
          <Copy size={16} aria-hidden="true" />
          {t("scheduleUi.duplicate")}
        </Button>
        {canEdit && (
          <Button
            variant="secondary"
            loading={cancel.isPending}
            onClick={() => {
              reset();
              cancel.mutate({ id });
            }}
          >
            <X size={16} aria-hidden="true" />
            {t("scheduleUi.cancelSchedule")}
          </Button>
        )}
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={16} aria-hidden="true" />
          {t("scheduleUi.delete")}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/schedule")}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t("scheduleUi.back")}
        </Button>
      </div>
      {savedMessage && (
        <FormMessage variant="success">{savedMessage}</FormMessage>
      )}
      {status.type !== "idle" && (
        <FormMessage variant={status.type}>{status.message}</FormMessage>
      )}
      {data.brokenReason && (
        <FormMessage variant="error">
          {t("scheduleUi.brokenMessage")}
        </FormMessage>
      )}
      <ScheduleDetailContent
        data={data}
        onNavigate={(path) => router.push(path)}
      />
      <ScheduleDeleteDialog
        open={deleteOpen}
        loading={deleteSchedule.isPending}
        onOpenChange={setDeleteOpen}
        onConfirm={() => deleteSchedule.mutate({ id })}
      />
    </section>
  );
}
