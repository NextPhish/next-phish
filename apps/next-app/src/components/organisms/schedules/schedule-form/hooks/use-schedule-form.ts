"use client";

import { useRouter } from "next/navigation";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import { scheduleFormValidator } from "../parts/schedule-form-validation";
import {
  toScheduleFormValues,
  toSchedulePayload,
} from "../parts/schedule-form-mapping";

export function useScheduleForm(campaignId?: string, scheduleId?: string) {
  const router = useRouter();
  const t = useTranslation();
  const { status, setError, reset } = useFormStatus();
  const schedule = trpc.campaign.getSchedule.useQuery(
    { id: scheduleId ?? "" },
    { enabled: Boolean(scheduleId) },
  );
  const campaigns = trpc.campaign.list.useQuery({
    status: "PUBLISHED",
    limit: 100,
    offset: 0,
  });
  const groups = trpc.targetGroup.list.useQuery({
    limit: 100,
    offset: 0,
    filters: { status: "ACTIVE" },
  });
  const create = trpc.campaign.createSchedule.useMutation();
  const update = trpc.campaign.updateSchedule.useMutation();
  const campaignRows = campaigns.data?.rows ?? [];
  async function submit(values: ScheduleFormValues) {
    reset();
    const payload = toSchedulePayload(values);
    try {
      if (scheduleId) {
        await update.mutateAsync({ id: scheduleId, data: payload });
        router.push(`/schedule/${scheduleId}?saved=updated`);
      } else {
        const result = await create.mutateAsync(payload);
        router.push(`/schedule/${result.schedule.id}?saved=created`);
      }
    } catch {
      setError(t("scheduleUi.saveFailed"));
    }
  }
  return {
    t,
    row: schedule.data,
    notFound: Boolean(scheduleId && !schedule.isLoading && !schedule.data),
    loading: schedule.isLoading || campaigns.isLoading || groups.isLoading,
    initialValues: toScheduleFormValues(schedule.data, campaignId),
    validate: scheduleFormValidator(t, campaignRows),
    submit,
    error:
      status.type === "error"
        ? status.message
        : campaigns.isError || groups.isError
          ? t("scheduleUi.catalogLoadFailed")
          : "",
    campaigns: campaignRows.map(({ id, name, type }) => ({ id, name, type })),
    targetGroups: groups.data?.targetGroups ?? [],
    cancel: () =>
      router.push(scheduleId ? `/schedule/${scheduleId}` : "/schedule"),
  };
}
