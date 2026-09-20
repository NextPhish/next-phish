"use client";

import { Badge } from "@next-phish/ui";
import {
  AppWindow,
  CalendarDays,
  CalendarX2,
  ChevronRight,
  Mail,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/router";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import { statusLabel, statusSeverity } from "./detail-format";

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--np-muted)]">
        {label}
      </dt>
      <dd className="mx-0 mt-1 break-words text-sm text-[var(--np-ink)]">
        {value}
      </dd>
    </div>
  );
}

function ResourceRow({
  icon: Icon,
  label,
  name,
  detail,
  status,
  onOpen,
}: {
  icon: LucideIcon;
  label: string;
  name: string;
  detail?: string;
  status?: string;
  onOpen?: () => void;
}) {
  const t = useTranslation();
  return (
    <button
      type="button"
      disabled={!onOpen}
      onClick={onOpen}
      className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface)] p-4 text-left transition-colors enabled:cursor-pointer enabled:hover:border-[var(--np-primary)] enabled:hover:bg-[var(--np-tint)]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--np-tint)] text-[var(--np-primary)]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-[var(--np-muted)]">{label}</span>
        <span className="block truncate text-sm font-medium text-[var(--np-ink)]">
          {name}
        </span>
        {detail ? (
          <span className="mt-0.5 block truncate text-xs text-[var(--np-muted)]">
            {detail}
          </span>
        ) : null}
      </span>
      {status ? (
        <Badge tone={statusSeverity(status)}>{statusLabel(status, t)}</Badge>
      ) : null}
      {onOpen ? (
        <ChevronRight
          size={18}
          className="text-[var(--np-muted)]"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

type CampaignDetail = NonNullable<
  inferRouterOutputs<AppRouter>["campaign"]["getById"]
>;
type CampaignSchedule = NonNullable<CampaignDetail["schedule"]>;
type Navigate = (path: string) => void;

function CampaignFacts({
  data,
  onNavigate,
}: {
  data: CampaignDetail;
  onNavigate: Navigate;
}) {
  const t = useTranslation();
  const locale = useLocale();
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 [&_h2]:text-[var(--np-ink)]">
      <h2 className="text-lg font-semibold text-[var(--np-ink)]">
        {t("campaignsUi.overview")}
      </h2>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem
          label={t("campaignsUi.campaignType")}
          value={t(`campaignsUi.types.${data.type}`)}
        />
        <DetailItem
          label={t("campaignsUi.targetTimezone")}
          value={data.targetTimezone}
        />
        <DetailItem
          label={t("campaignsUi.automaticCompletion")}
          value={
            data.autoCompleteAfterDays
              ? t("campaignsUi.daysAfterStart", {
                  count: data.autoCompleteAfterDays,
                })
              : t("campaignsUi.disabled")
          }
        />
        <DetailItem
          label={t("campaignsUi.createdBy")}
          value={data.createdBy.name || data.createdBy.email}
        />
        <DetailItem
          label={t("campaignsUi.created")}
          value={new Date(data.createdAt).toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: data.targetTimezone,
          })}
        />
        <DetailItem
          label={t("campaignsUi.lastUpdated")}
          value={new Date(data.updatedAt).toLocaleString(locale, {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: data.targetTimezone,
          })}
        />
        {data.sourceCampaign ? (
          <DetailItem
            label={t("campaignsUi.clonedFrom")}
            value={
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-[var(--np-primary)] hover:underline"
                onClick={() =>
                  onNavigate(`/campaigns/${data.sourceCampaign?.id}`)
                }
              >
                {data.sourceCampaign.name}
              </button>
            }
          />
        ) : null}
        <DetailItem
          label={t("campaignsUi.clones")}
          value={data._count.clones}
        />
        <DetailItem label={t("campaignsUi.campaignId")} value={data.id} />
      </dl>
      <div className="mt-5 border-t border-[var(--np-border)] pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--np-muted)]">
          {t("campaignsUi.tags")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.tags.length ? (
            data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--np-tint)] px-[0.65rem] py-1 text-xs font-semibold text-[var(--np-primary)]"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-[var(--np-muted)]">
              {t("campaignsUi.noTags")}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function CampaignAssets({
  data,
  recipientCount,
  onNavigate,
}: {
  data: CampaignDetail;
  recipientCount: number;
  onNavigate: Navigate;
}) {
  const t = useTranslation();
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 [&_h2]:text-[var(--np-ink)]">
      <h2 className="text-lg font-semibold text-[var(--np-ink)]">
        {t("campaignsUi.campaignAssets")}
      </h2>
      <p className="mt-1 text-sm text-[var(--np-muted)]">
        {t("campaignsUi.assetsDescription")}
      </p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <ResourceRow
          icon={Mail}
          label={t("campaignsUi.emailTemplate")}
          name={data.emailTemplate?.name ?? t("campaignsUi.notSelected")}
          detail={data.emailTemplate?.tags.join(", ") || undefined}
          status={data.emailTemplate?.status}
          onOpen={
            data.emailTemplate
              ? () => onNavigate(`/email-templates/${data.emailTemplate?.id}`)
              : undefined
          }
        />
        <ResourceRow
          icon={AppWindow}
          label={t("campaignsUi.landingPage")}
          name={data.page?.name ?? t("campaignsUi.notSelected")}
          detail={data.page ? formatLabel(data.page.type) : undefined}
          status={data.page?.status}
          onOpen={
            data.page ? () => onNavigate(`/pages/${data.page?.id}`) : undefined
          }
        />
        <ResourceRow
          icon={Send}
          label={t("campaignsUi.sendingProfile")}
          name={data.mailSendingProfile?.name ?? t("campaignsUi.notSelected")}
          detail={
            data.mailSendingProfile
              ? `${formatLabel(data.mailSendingProfile.providerType)} · ${data.mailSendingProfile.fromName} <${data.mailSendingProfile.fromEmail}>`
              : undefined
          }
          onOpen={
            data.mailSendingProfile
              ? () =>
                  onNavigate(`/sending-profiles/${data.mailSendingProfile?.id}`)
              : undefined
          }
        />
        <ResourceRow
          icon={Users}
          label={t("campaignsUi.targetGroup")}
          name={
            data.targetGroup?.name ??
            (data.type === "TEMPLATE"
              ? t("campaignsUi.selectedWhenScheduled")
              : t("campaignsUi.notSelected"))
          }
          detail={
            data.targetGroup
              ? t("campaignsUi.recipientCount", { count: recipientCount })
              : undefined
          }
          status={data.targetGroup?.status}
          onOpen={
            data.targetGroup
              ? () => onNavigate(`/target-groups/${data.targetGroup?.id}`)
              : undefined
          }
        />
      </div>
    </section>
  );
}

function CampaignAudience({
  data,
  recipientCount,
}: {
  data: CampaignDetail;
  recipientCount: number;
}) {
  const t = useTranslation();
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 [&_h2]:text-[var(--np-ink)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--np-ink)]">
          {t("campaignsUi.audience")}
        </h2>
        <Users
          size={20}
          className="text-[var(--np-primary)]"
          aria-hidden="true"
        />
      </div>
      <dl className="mt-5 space-y-4">
        <DetailItem
          label={t("campaignsUi.targetGroup")}
          value={
            data.targetGroup?.name ?? t("campaignsUi.inheritedWhenScheduled")
          }
        />
        <DetailItem
          label={t("campaignsUi.recipients")}
          value={recipientCount || "—"}
        />
        <DetailItem
          label={t("campaignsUi.timezone")}
          value={data.targetTimezone}
        />
      </dl>
    </section>
  );
}

function CampaignSchedules({
  schedules,
  onNavigate,
}: {
  schedules: CampaignSchedule[];
  onNavigate: Navigate;
}) {
  const t = useTranslation();
  const locale = useLocale();
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 [&_h2]:text-[var(--np-ink)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--np-ink)]">
          {t("campaignsUi.schedule")}
        </h2>
        <CalendarDays
          size={20}
          className="text-[var(--np-primary)]"
          aria-hidden="true"
        />
      </div>
      {schedules.length ? (
        <div className="mt-4 space-y-3">
          {schedules.map((schedule) => (
            <button
              key={schedule.id}
              type="button"
              onClick={() => onNavigate(`/schedule/${schedule.id}`)}
              className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface)] p-4 text-left transition-colors enabled:cursor-pointer enabled:hover:border-[var(--np-primary)] enabled:hover:bg-[var(--np-tint)]"
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium text-[var(--np-ink)]">
                    {schedule.name}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--np-muted)]">
                    {new Date(schedule.startsAt).toLocaleString(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: schedule.targetTimezone,
                    })}
                  </span>
                </span>
                <Badge tone={statusSeverity(schedule.status)}>
                  {statusLabel(schedule.status, t)}
                </Badge>
              </span>
              <span className="mt-3 block text-xs text-[var(--np-muted)]">
                {t(`campaignsUi.deliveryModes.${schedule.deliveryMode}`)} ·{" "}
                {schedule.targetTimezone}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--np-border)] px-4 py-8 text-center">
          <CalendarX2
            size={24}
            className="mx-auto text-[var(--np-muted)]"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm text-[var(--np-muted)]">
            {t("campaignsUi.noSchedule")}
          </p>
        </div>
      )}
    </section>
  );
}

export function CampaignDetailContent({
  data,
  recipientCount,
  schedules,
  onNavigate,
}: {
  data: CampaignDetail;
  recipientCount: number;
  schedules: CampaignSchedule[];
  onNavigate: Navigate;
}) {
  const t = useTranslation();
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
      <div className="space-y-6">
        <CampaignFacts data={data} onNavigate={onNavigate} />
        <CampaignAssets
          data={data}
          recipientCount={recipientCount}
          onNavigate={onNavigate}
        />
      </div>
      <div className="space-y-6">
        <CampaignAudience data={data} recipientCount={recipientCount} />
        <CampaignSchedules schedules={schedules} onNavigate={onNavigate} />
        {data.brokenAt || data.brokenReason ? (
          <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
            <h2 className="font-semibold text-red-700">
              {t("campaignsUi.campaignHealth")}
            </h2>
            <p className="mt-2 text-sm text-red-700">
              {data.brokenReason ?? t("campaignsUi.resourcesAttention")}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
