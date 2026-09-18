"use client";

import { useCallback, useMemo } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { inferRouterOutputs } from "@trpc/server";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  RowActionsMenu,
  EmptyState,
  useDataTableState,
  type ColumnDef,
} from "@next-phish/ui";
import type { AppRouter } from "@/src/server/trpc/router";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import { uiTableLabels } from "@/src/lib/ui-table-labels";
import styles from "./schedule-detail.module.css";
import { ScheduleDetailPrimary } from "./schedule-detail-primary";
import { ScheduleDetailSecondary } from "./schedule-detail-secondary";

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
          <RowActionsMenu
            label={`${t("tableUi.actions")}: ${row.original.name}`}
            items={[
              {
                label: t("scheduleUi.viewCampaign"),
                icon: <ArrowRight size={16} />,
                onSelect: () => onNavigate(`/campaigns/${row.original.id}`),
              },
            ]}
          />
        ),
      },
    ],
    [formatDate, onNavigate, t],
  );

  return (
    <div className={styles.content}>
      <ScheduleDetailPrimary
        data={data}
        formatDate={formatDate}
        onNavigate={onNavigate}
      />
      <ScheduleDetailSecondary data={data} formatDate={formatDate} />
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
