"use client";

import { useCallback, useMemo } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  useDataTableState,
  type ColumnDef,
} from "@next-phish/ui";
import type { AppRouter } from "@/src/server/trpc/router";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import styles from "./schedule-detail.module.css";

export type ScheduleDetail = NonNullable<
  inferRouterOutputs<AppRouter>["campaign"]["getSchedule"]
>;
type GeneratedCampaign = ScheduleDetail["campaigns"][number];

function enumLabel(t: TranslationFunction, value: string): string {
  return t(`scheduleUi.values.${value}`);
}

function campaignTone(status: string) {
  if (status === "CANCELLED" || status === "FAILED") return "danger" as const;
  if (status === "COMPLETED") return "success" as const;
  if (status === "ACTIVE" || status === "RUNNING") return "info" as const;
  if (status === "PAUSED") return "warning" as const;
  return "neutral" as const;
}

function DetailItem({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      {helper && <p>{helper}</p>}
    </div>
  );
}

export function ScheduleDetailContent({
  data,
  onNavigate,
}: {
  data: ScheduleDetail;
  onNavigate: (path: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslation();
  const { state, onStateChange } = useDataTableState({
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: data.targetTimezone,
      }),
    [data.targetTimezone, locale],
  );
  const formatDate = useCallback(
    (value: Date | string | null) =>
      value ? formatter.format(new Date(value)) : t("scheduleUi.notSet"),
    [formatter, t],
  );

  const deliverySummary =
    data.deliveryMode === "DRIP"
      ? t("scheduleUi.dripSummary", { count: data.dripEmailsPerMinute ?? "—" })
      : data.deliveryMode === "BATCH"
        ? t("scheduleUi.batchSummary", {
            count: data.batchSize ?? "—",
            minutes: data.batchIntervalMinutes ?? "—",
          })
        : t("scheduleUi.blastSummary");
  const recurrenceParts =
    data.type === "ONE_TIME"
      ? [t("scheduleUi.runsOnce")]
      : [
          data.frequency
            ? enumLabel(t, data.frequency)
            : t("scheduleUi.repeating"),
        ];
  if (data.weekday !== null)
    recurrenceParts.push(
      t("scheduleUi.detailWeekday", { value: data.weekday }),
    );
  if (data.dayOfMonth !== null)
    recurrenceParts.push(
      t("scheduleUi.detailDayOfMonth", { value: data.dayOfMonth }),
    );
  if (data.month !== null)
    recurrenceParts.push(t("scheduleUi.detailMonth", { value: data.month }));
  if (data.localTimeMinutes !== null)
    recurrenceParts.push(
      `${String(Math.floor(data.localTimeMinutes / 60)).padStart(2, "0")}:${String(data.localTimeMinutes % 60).padStart(2, "0")}`,
    );

  const columns = useMemo<ColumnDef<GeneratedCampaign>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("scheduleUi.campaignName"),
        cell: ({ row }) => <strong>{row.original.name}</strong>,
      },
      {
        accessorKey: "occurrenceAt",
        header: t("scheduleUi.occurrence"),
        cell: ({ row }) => formatDate(row.original.occurrenceAt),
      },
      {
        accessorKey: "status",
        header: t("scheduleUi.status"),
        cell: ({ row }) => (
          <Badge tone={campaignTone(row.original.status)}>
            {enumLabel(t, row.original.status)}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: t("tableUi.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`${t("scheduleUi.viewCampaign")}: ${row.original.name}`}
            onClick={() => onNavigate(`/campaigns/${row.original.id}`)}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [formatDate, onNavigate, t],
  );

  return (
    <div className={styles.content}>
      <div className={styles.primaryColumn}>
        <Card>
          <CardHeader
            title={t("scheduleUi.detailOverviewTitle")}
            description={t("scheduleUi.detailOverviewDescription")}
          />
          <CardBody className="pt-0">
            <dl className={styles.detailGrid}>
              <DetailItem
                label={t("scheduleUi.firstOccurrence")}
                value={formatDate(data.startsAt)}
              />
              <DetailItem
                label={t("scheduleUi.nextOccurrence")}
                value={formatDate(data.nextOccurrenceAt)}
              />
              <DetailItem
                label={t("scheduleUi.timezone")}
                value={data.targetTimezone}
              />
              <DetailItem
                label={t("scheduleUi.delivery")}
                value={enumLabel(t, data.deliveryMode)}
                helper={deliverySummary}
              />
              <DetailItem
                label={t("scheduleUi.targetGroup")}
                value={
                  data.targetGroup?.name ?? t("scheduleUi.inheritedTarget")
                }
                helper={
                  data.targetGroup
                    ? t("scheduleUi.recipientCount", {
                        count: data.targetGroup._count?.users ?? 0,
                      })
                    : undefined
                }
              />
              <DetailItem
                label={t("scheduleUi.detailAutoComplete")}
                value={
                  data.autoCompleteAfterDays
                    ? t("scheduleUi.daysAfterStart", {
                        count: data.autoCompleteAfterDays,
                      })
                    : t("scheduleUi.disabled")
                }
              />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t("scheduleUi.sourcesTitle")}
            description={t("scheduleUi.sourcesDescription")}
          />
          <CardBody className={`pt-0 ${styles.sourceList}`}>
            {data.sources.map((source, index) => (
              <article key={source.campaignId} className={styles.source}>
                <div>
                  <span className={styles.position}>#{index + 1}</span>
                  <h3>{source.campaign.name}</h3>
                  <Badge>{enumLabel(t, source.campaign.type)}</Badge>
                  <p>
                    {enumLabel(t, source.campaign.status)} ·{" "}
                    {t("scheduleUi.updated")}{" "}
                    {formatDate(source.campaign.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(`/campaigns/${source.campaignId}`)}
                >
                  {t("scheduleUi.viewCampaign")}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </article>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className={styles.secondaryColumn}>
        <Card>
          <CardHeader title={t("scheduleUi.recurrenceTitle")} />
          <CardBody className="pt-0">
            <dl className={styles.detailList}>
              <DetailItem
                label={t("scheduleUi.pattern")}
                value={recurrenceParts.join(" · ")}
              />
              <DetailItem
                label={t("scheduleUi.selectionStrategy")}
                value={
                  data.selectionStrategy
                    ? enumLabel(t, data.selectionStrategy)
                    : t("scheduleUi.notApplicable")
                }
                helper={
                  data.selectionStrategy === "DECK"
                    ? data.shuffleDeck
                      ? t("scheduleUi.deckShuffled")
                      : t("scheduleUi.sourceOrder")
                    : undefined
                }
              />
              <DetailItem
                label={t("scheduleUi.maximumCampaigns")}
                value={data.maxCampaigns?.toString() ?? t("scheduleUi.noLimit")}
              />
              <DetailItem
                label={t("scheduleUi.ends")}
                value={formatDate(data.endsAt)}
              />
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={t("scheduleUi.metadataTitle")} />
          <CardBody className="pt-0">
            <dl className={styles.detailList}>
              <DetailItem
                label={t("scheduleUi.createdBy")}
                value={data.createdBy.name || data.createdBy.email}
                helper={data.createdBy.email}
              />
              <DetailItem
                label={t("scheduleUi.created")}
                value={formatDate(data.createdAt)}
              />
              <DetailItem
                label={t("scheduleUi.lastUpdated")}
                value={formatDate(data.updatedAt)}
              />
              <DetailItem
                label={t("scheduleUi.completed")}
                value={formatDate(data.completedAt)}
              />
              <DetailItem
                label={t("scheduleUi.cancelled")}
                value={formatDate(data.cancelledAt)}
              />
              <DetailItem label={t("scheduleUi.scheduleId")} value={data.id} />
            </dl>
          </CardBody>
        </Card>
      </div>

      <div className={styles.campaigns}>
        {data.campaigns.length ? (
          <DataTable
            caption={t("scheduleUi.generatedTitle")}
            data={data.campaigns}
            columns={columns}
            getRowId={(row) => row.id}
            state={state}
            onStateChange={onStateChange}
            labels={uiTableLabels(t)}
          />
        ) : (
          <Card>
            <CardHeader
              title={t("scheduleUi.generatedTitle")}
              description={t("scheduleUi.generatedDescription")}
            />
            <CardBody className="pt-0">
              <EmptyState
                icon={<CalendarClock size={24} />}
                title={t("scheduleUi.generatedEmpty")}
                description={t("scheduleUi.generatedEmptyHint")}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
