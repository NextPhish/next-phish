"use client";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { PageHeader, Skeleton } from "@next-phish/ui";
import type { ScheduleFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import { ScheduleFormPresentation } from "./form-presentation";
import styles from "./schedule-form.module.css";
import { scheduleFormValidator } from "./schedule-form-validation";

function toLocalInput(value: Date | string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
export function ScheduleFormContainer({
  campaignId,
  scheduleId,
}: {
  campaignId?: string;
  scheduleId?: string;
}) {
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
  const row = schedule.data;
  const campaignRows = campaigns.data?.rows ?? [];
  const initialValues: ScheduleFormValues = {
    name: row?.name ?? "",
    type: row?.type ?? "ONE_TIME",
    sourceCampaignIds:
      row?.sources.map((s) => s.campaignId) ?? (campaignId ? [campaignId] : []),
    targetGroupId: row?.targetGroupId ?? null,
    targetTimezone:
      row?.targetTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    startsAt: toLocalInput(row?.startsAt ?? null) ?? "",
    frequency: row?.frequency ?? null,
    localTimeMinutes: row?.localTimeMinutes ?? null,
    weekday: row?.weekday ?? null,
    dayOfMonth: row?.dayOfMonth ?? null,
    month: row?.month ?? null,
    selectionStrategy: row?.selectionStrategy ?? null,
    shuffleDeck: row?.shuffleDeck ?? false,
    deliveryMode: row?.deliveryMode ?? "BLAST",
    dripEmailsPerMinute: row?.dripEmailsPerMinute ?? null,
    batchSize: row?.batchSize ?? null,
    batchIntervalMinutes: row?.batchIntervalMinutes ?? null,
    maxCampaigns: row?.maxCampaigns ?? null,
    endsAt: toLocalInput(row?.endsAt ?? null),
    autoCompleteAfterDays: row ? row.autoCompleteAfterDays : 20,
  };
  const validate = scheduleFormValidator(t, campaignRows);
  async function submit(values: ScheduleFormValues) {
    reset();
    const recurring = values.type === "RECURRING";
    const payload = {
      ...values,
      startsAt: new Date(values.startsAt),
      endsAt: values.endsAt ? new Date(values.endsAt) : null,
      maxCampaigns: recurring ? values.maxCampaigns : null,
      frequency: recurring ? values.frequency : null,
      selectionStrategy: recurring ? values.selectionStrategy : null,
      localTimeMinutes: recurring ? values.localTimeMinutes : null,
      weekday: recurring ? values.weekday : null,
      dayOfMonth: recurring ? values.dayOfMonth : null,
      month: recurring ? values.month : null,
      shuffleDeck: recurring ? values.shuffleDeck : false,
    };
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
  const loading = schedule.isLoading || campaigns.isLoading || groups.isLoading;
  if (scheduleId && !schedule.isLoading && !row)
    return (
      <div className={`np-theme ${styles.page}`}>
        <p className={styles.empty}>{t("scheduleUi.notFound")}</p>
      </div>
    );
  return (
    <div className={`np-theme ${styles.page}`}>
      <PageHeader
        title={t(
          scheduleId ? "scheduleUi.editTitle" : "scheduleUi.createTitle",
        )}
        description={t("scheduleUi.formSubtitle")}
      />
      {loading ? (
        <div
          className={styles.skeleton}
          role="status"
          aria-label={t("scheduleUi.loadingForm")}
        >
          <Skeleton style={{ height: 220 }} />
          <Skeleton style={{ height: 180 }} />
          <Skeleton style={{ height: 160 }} />
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validateOnChange={false}
          validate={validate}
          onSubmit={submit}
        >
          <ScheduleFormPresentation
            error={
              status.type === "error"
                ? status.message
                : campaigns.isError || groups.isError
                  ? t("scheduleUi.catalogLoadFailed")
                  : ""
            }
            campaigns={campaignRows.map(({ id, name, type }) => ({
              id,
              name,
              type,
            }))}
            targetGroups={groups.data?.targetGroups ?? []}
            onCancel={() =>
              router.push(scheduleId ? `/schedule/${scheduleId}` : "/schedule")
            }
          />
        </Formik>
      )}
    </div>
  );
}
