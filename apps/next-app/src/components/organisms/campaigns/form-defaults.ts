import type { CampaignFormValues } from "@next-phish/shared";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/router";

type Campaign = NonNullable<
  inferRouterOutputs<AppRouter>["campaign"]["getById"]
>;
type Schedule = NonNullable<Campaign["schedule"]>;

function toLocalInput(value: Date | string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function activeSchedule(
  row: Campaign | null | undefined,
): Schedule | undefined {
  return row?.scheduleSources
    .map((source) => source.schedule)
    .find((schedule) => !["COMPLETED", "CANCELLED"].includes(schedule.status));
}

export function campaignFormDefaults(
  row: Campaign | null | undefined,
  schedule: Schedule | undefined,
): CampaignFormValues {
  const defaultTimezone =
    row?.targetTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    name: row?.name ?? "",
    tags: row?.tags ?? [],
    type: row?.type ?? "CONCRETE",
    status:
      (row?.type ?? "CONCRETE") === "CONCRETE" || row?.status === "PUBLISHED"
        ? "PUBLISHED"
        : "DRAFT",
    emailTemplateId: row?.emailTemplateId ?? "",
    pageId: row?.pageId ?? "",
    mailSendingProfileId: row?.mailSendingProfileId ?? "",
    targetGroupId: row?.targetGroupId ?? null,
    targetTimezone: defaultTimezone,
    automaticallyComplete: row?.autoCompleteAfterDays !== null,
    autoCompleteAfterDays: row?.autoCompleteAfterDays ?? 20,
    scheduleEnabled:
      (row?.type ?? "CONCRETE") === "CONCRETE" || Boolean(schedule),
    scheduleName: row?.name ?? schedule?.name ?? "Campaign",
    scheduleStartsAt: toLocalInput(schedule?.startsAt ?? new Date()),
    scheduleTargetTimezone: schedule?.targetTimezone ?? defaultTimezone,
    scheduleDeliveryMode: schedule?.deliveryMode ?? "BLAST",
    scheduleDripEmailsPerMinute: schedule?.dripEmailsPerMinute ?? null,
    scheduleBatchSize: schedule?.batchSize ?? null,
    scheduleBatchIntervalMinutes: schedule?.batchIntervalMinutes ?? null,
  };
}

export function buildSchedulePayload(
  values: CampaignFormValues,
  saved: { id: string; targetGroupId: string | null },
  autoCompleteAfterDays: number | null,
) {
  return {
    name: values.name,
    type: "ONE_TIME" as const,
    sourceCampaignIds: [saved.id],
    targetGroupId: saved.targetGroupId,
    targetTimezone: values.scheduleTargetTimezone,
    startsAt: new Date(values.scheduleStartsAt),
    frequency: null,
    localTimeMinutes: null,
    weekday: null,
    dayOfMonth: null,
    month: null,
    selectionStrategy: null,
    shuffleDeck: false,
    deliveryMode: values.scheduleDeliveryMode,
    dripEmailsPerMinute:
      values.scheduleDeliveryMode === "DRIP"
        ? values.scheduleDripEmailsPerMinute
        : null,
    batchSize:
      values.scheduleDeliveryMode === "BATCH" ? values.scheduleBatchSize : null,
    batchIntervalMinutes:
      values.scheduleDeliveryMode === "BATCH"
        ? values.scheduleBatchIntervalMinutes
        : null,
    maxCampaigns: null,
    endsAt: null,
    autoCompleteAfterDays,
  };
}
