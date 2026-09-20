"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { ScheduleDeleteDialog } from "./parts/schedule-delete-dialog";
import { ScheduleDetailContent } from "./parts/schedule-detail-content";
import { ScheduleDetailSkeleton } from "./parts/schedule-detail-skeleton";
import { useScheduleDetailActions } from "./hooks/use-schedule-detail-actions";
import { ScheduleDetailToolbar } from "./parts/schedule-detail-toolbar";
import { ScheduleDetailEmptyState } from "./parts/schedule-detail-empty-state";
import { ScheduleDetailNotices } from "./parts/schedule-detail-notices";

export function ScheduleDetail({ id, saved }: { id: string; saved?: string }) {
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
    <section className="grid grid-cols-[minmax(0,1fr)] gap-6 [&>.np-page-header]:mb-0">
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
