"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n/client";
import {
  makeTimelineRange,
  buildTimelineRows,
} from "../parts/schedule-timeline-data";
import type { ScheduleTimelineProps } from "../types/schedule-timeline.types";

export function useScheduleTimeline({
  variant = "legacy",
  locale,
  labels,
}: ScheduleTimelineProps = {}) {
  const router = useRouter();
  const t = useTranslation();
  const range = useMemo(() => makeTimelineRange(), []);
  const { data, isLoading, error } =
    trpc.campaign.getScheduleTimeline.useQuery(range);
  const mediumDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );
  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale],
  );
  const rows = useMemo(() => buildTimelineRows(data, range), [data, range]);
  const onRowNavigate = useCallback(
    (row: (typeof rows)[number]) =>
      router.push(
        row.kind === "schedule"
          ? `/schedule/${row.id}`
          : `/campaigns/${row.id}`,
      ),
    [router],
  );
  return {
    variant,
    labels,
    rows,
    range,
    shortDateFormatter,
    statusLabel: (status: string) => t(`scheduleUi.values.${status}`),
    onRowNavigate,
    isLoading,
    mediumDateFormatter,
    error: Boolean(error),
  };
}
