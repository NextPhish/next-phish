"use client";

import { FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ScheduleDetail } from "./schedule-detail-content";

export function ScheduleDetailNotices({
  saved,
  status,
  data,
}: {
  saved?: string;
  status: { type: "idle" } | { type: "error" | "success"; message: string };
  data: ScheduleDetail;
}) {
  const t = useTranslation();
  const savedMessage =
    saved === "created"
      ? t("scheduleUi.createdSuccess")
      : saved === "updated"
        ? t("scheduleUi.updatedSuccess")
        : saved === "duplicated"
          ? t("scheduleUi.duplicateSuccess")
          : "";

  return (
    <>
      {savedMessage && (
        <FormMessage variant="success">{savedMessage}</FormMessage>
      )}
      {status.type !== "idle" && (
        <FormMessage variant={status.type}>{status.message}</FormMessage>
      )}
      {data.brokenReason && (
        <FormMessage variant="error">
          {t("scheduleUi.brokenMessage")}
        </FormMessage>
      )}
    </>
  );
}
