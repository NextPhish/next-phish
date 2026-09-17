import type { TranslationFunction } from "@/src/lib/i18n/shared";
export function statusLabel(status: string, t: TranslationFunction) {
  const known = [
    "DRAFT",
    "PUBLISHED",
    "SCHEDULED",
    "PENDING_START",
    "ACTIVE",
    "PAUSED",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
  ];
  return t(
    `campaignsUi.statuses.${known.includes(status) ? status : "UNKNOWN"}`,
  );
}
export function statusSeverity(status: string) {
  if (["PUBLISHED", "ACTIVE"].includes(status)) return "success" as const;
  if (["FAILED", "CANCELLED"].includes(status)) return "danger" as const;
  if (["PENDING_START", "SCHEDULED", "PAUSED"].includes(status))
    return "warning" as const;
  return "neutral" as const;
}
