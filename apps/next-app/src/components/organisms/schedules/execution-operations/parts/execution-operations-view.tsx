"use client";
import {
  Card,
  CardBody,
  Skeleton,
  FormMessage,
  Button,
  HelpPopover,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import type { ExecutionOperationsModel } from "../hooks/use-execution-operations";
export function ExecutionOperationsView({
  operations,
}: {
  operations: ExecutionOperationsModel;
}) {
  const t = useTranslation();
  function lag(ms: number) {
    if (ms < 1000) return t("scheduleUi.current");
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1)
      return t("scheduleUi.seconds", { count: Math.floor(ms / 1000) });
    if (minutes < 60) return t("scheduleUi.minutes", { count: minutes });
    return t("scheduleUi.hoursMinutes", {
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    });
  }
  const data = operations.data;
  const cards = data
    ? [
        {
          key: "due",
          value: data.dueSchedules,
          detail: data.dueSchedules
            ? t("scheduleUi.oldestWait", { lag: lag(data.scheduleLagMs) })
            : t("scheduleUi.noWaiting"),
          alert: data.scheduleLagMs > 60000,
        },
        {
          key: "pending",
          value: data.pendingOutbox,
          detail: data.pendingOutbox
            ? t("scheduleUi.oldestWait", { lag: lag(data.outboxLagMs) })
            : t("scheduleUi.noWaiting"),
          alert: data.outboxLagMs > 60000,
        },
        {
          key: "unknown",
          value: data.deliveryUnknown,
          detail: t(
            data.deliveryUnknown
              ? "scheduleUi.manualReview"
              : "scheduleUi.noReview",
          ),
          alert: data.deliveryUnknown > 0,
        },
        {
          key: "failed",
          value: data.failedRecipients,
          detail: t(
            data.failedRecipients
              ? "scheduleUi.noRetry"
              : "scheduleUi.noFailures",
          ),
          alert: data.failedRecipients > 0,
        },
      ]
    : [];
  return (
    <section aria-labelledby="delivery-health-heading">
      <div className="mb-4 [&_h2]:text-lg [&_h2]:font-[650] [&_h2]:text-[var(--np-ink)] [&_p]:mt-[5px] [&_p]:text-[13px] [&_p]:text-[var(--np-muted)]">
        <h2 id="delivery-health-heading">{t("scheduleUi.healthTitle")}</h2>
        <p>{t("scheduleUi.healthDescription")}</p>
      </div>
      {operations.isLoading ? (
        <div
          className="grid grid-cols-[minmax(0,1fr)] gap-3 min-[361px]:grid-cols-2 min-[1001px]:grid-cols-4"
          aria-label={t("common.loading")}
          role="status"
        >
          {["due", "pending", "unknown", "failed"].map((key) => (
            <Skeleton key={key} className="h-[124px] rounded-xl" />
          ))}
        </div>
      ) : operations.error ? (
        <FormMessage
          variant="error"
          action={
            <Button variant="secondary" onClick={() => operations.refetch()}>
              {t("tableUi.retry")}
            </Button>
          }
        >
          {t("scheduleUi.healthFailed")}
        </FormMessage>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 min-[361px]:grid-cols-2 min-[1001px]:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.key}>
              <CardBody className="flex h-full flex-col gap-1 px-3.5 py-3 [&_strong]:text-2xl [&_strong]:leading-[1.2] [&_strong]:text-[var(--np-ink)] [&_strong]:[font-variant-numeric:tabular-nums]">
                <div className="flex min-h-[34px] items-center justify-between gap-1 text-xs font-semibold text-[var(--np-muted)] [&_svg]:shrink-0">
                  <span>{t(`scheduleUi.health.${card.key}.label`)}</span>
                  <HelpPopover label={t(`scheduleUi.health.${card.key}.label`)}>
                    {t(`scheduleUi.health.${card.key}.description`)}
                  </HelpPopover>
                </div>
                <strong className={card.alert ? "!text-[#9b610b]" : undefined}>
                  {card.value}
                </strong>
                <span className="text-[11px] font-medium text-[var(--np-muted)]">
                  {card.detail}
                </span>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
