"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { ScheduleDeleteDialog } from "./schedule-delete-dialog";
import { ScheduleDetailContent } from "./schedule-detail-content";
import { ScheduleDetailSkeleton } from "./schedule-detail-skeleton";
import styles from "./schedule-detail.module.css";
import { useScheduleDetailActions } from "@/src/hooks/use-schedule-detail-actions";
import { ScheduleDetailToolbar } from "./schedule-detail-toolbar";
import { ScheduleDetailEmptyState } from "./schedule-detail-empty-state";
import { ScheduleDetailNotices } from "./schedule-detail-notices";

export function ScheduleDetailContainer({
  id,
  saved,
}: {
  id: string;
  saved?: string;
}) {
  const router = useRouter();
  const t = useTranslation();
  const {
    status,
    reset,
    deleteOpen,
    setDeleteOpen,
    cancel,
    duplicate,
    activate,
    deleteSchedule,
  } = useScheduleDetailActions(id);
  const { data, isLoading, error, refetch } =
    trpc.campaign.getSchedule.useQuery({ id });
  if (isLoading)
    return <ScheduleDetailSkeleton label={t("scheduleUi.loadingDetail")} />;
  if (error || !data)
    return (
      <ScheduleDetailEmptyState
        failed={Boolean(error)}
        onRetry={() => void refetch()}
      />
    );

  return (
    <section className={styles.root}>
      <ScheduleDetailToolbar
        id={id}
        data={data}
        onNavigate={(path) => router.push(path)}
        onActivate={() => {
          reset();
          activate.mutate({ id });
        }}
        onDuplicate={() => {
          reset();
          duplicate.mutate({ id });
        }}
        onCancel={() => {
          reset();
          cancel.mutate({ id });
        }}
        onDelete={() => setDeleteOpen(true)}
        activatePending={activate.isPending}
        duplicatePending={duplicate.isPending}
        cancelPending={cancel.isPending}
      />
      <ScheduleDetailNotices saved={saved} status={status} data={data} />
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
