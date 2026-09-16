import type { ScheduleFormValues } from "@next-phish/shared";
import type { ScheduleDetail } from "./schedule-detail-content";

function toLocalInput(value: Date | string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}
export function toScheduleFormValues(
  row: ScheduleDetail | null | undefined,
  campaignId?: string,
): ScheduleFormValues {
  return {
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
}

export function toSchedulePayload(values: ScheduleFormValues) {
  const recurring = values.type === "RECURRING";
  return {
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
}
