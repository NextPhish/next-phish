"use client";

import { Badge, Button, FormMessage, Skeleton } from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n/client";

export type TimelineEvent = {
  id: string;
  source: "Campaign" | "Delivery";
  type: string;
  occurredAt: Date | string;
  metadata?: unknown;
};

const eventColors: Record<string, string> = {
  SCHEDULED: "#3B82F6",
  QUEUED: "#64748B",
  DISPATCH_STARTED: "#2563EB",
  ACCEPTED: "#06B6D4",
  SENT: "#14B8A6",
  DELIVERED: "#22C55E",
  DEFERRED: "#EAB308",
  RETRY_SCHEDULED: "#F97316",
  DELIVERY_UNKNOWN: "#F59E0B",
  OPENED: "#8B5CF6",
  CLICKED: "#0EA5E9",
  SUBMITTED: "#F97316",
  REPORTED: "#A855F7",
  BOUNCED: "#EF4444",
  REJECTED: "#E11D48",
  FAILED: "#DC2626",
  CANCELLED: "#71717A",
};

function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function RecipientTimelineView({
  events,
  loading,
  error,
  onRetry,
  timeZone,
}: {
  events: TimelineEvent[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  timeZone: string;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const eventLabel = (value: string) =>
    t(`campaignsUi.events.${value in eventColors ? value : "UNKNOWN"}`);
  if (loading) return <Skeleton style={{ height: "8rem" }} />;
  if (error)
    return (
      <FormMessage
        variant="error"
        action={
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {t("tableUi.retry")}
          </Button>
        }
      >
        {t("campaignsUi.eventsError")}
      </FormMessage>
    );
  if (!events.length)
    return (
      <p className="text-sm text-[var(--np-muted)]">
        {t("campaignsUi.noEvents")}
      </p>
    );
  return (
    <ol className="grid gap-4 border-l border-[var(--np-border)] pl-5">
      {events.map((event) => {
        const metadata =
          event.metadata &&
          typeof event.metadata === "object" &&
          !Array.isArray(event.metadata)
            ? Object.entries(event.metadata)
            : [];
        return (
          <li key={`${event.source}-${event.id}`} className="relative">
            <span
              className="absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full ring-4 ring-[var(--np-surface)]"
              style={{ backgroundColor: eventColors[event.type] ?? "#64748B" }}
            />
            <div className="flex flex-wrap gap-2">
              <strong>{eventLabel(event.type)}</strong>
              <Badge tone="neutral">
                {t(`campaignsUi.eventSources.${event.source}`)}
              </Badge>
            </div>
            <time className="text-xs text-[var(--np-muted)]">
              {new Date(event.occurredAt).toLocaleString(locale, {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone,
              })}
            </time>
            {metadata.length > 0 && (
              <dl className="mt-1 grid gap-x-4 text-xs sm:grid-cols-2">
                {metadata.map(([key, value]) => (
                  <div key={key}>
                    <dt className="inline text-[var(--np-muted)]">
                      {label(key)}:{" "}
                    </dt>
                    <dd className="inline">
                      {value === null ? "—" : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ol>
  );
}
