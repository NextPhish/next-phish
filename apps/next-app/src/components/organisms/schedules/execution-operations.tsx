"use client";
import {
  Card,
  CardBody,
  Skeleton,
  FormMessage,
  Button,
  HelpPopover,
} from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./schedule-overview.module.css";
export function ExecutionOperations() {
  const t = useTranslation();
  const operations = trpc.campaign.executionOperations.useQuery(undefined, {
    refetchInterval: 10000,
  });
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
      <div className={styles.sectionHeading}>
        <h2 id="delivery-health-heading">{t("scheduleUi.healthTitle")}</h2>
        <p>{t("scheduleUi.healthDescription")}</p>
      </div>
      {operations.isLoading ? (
        <div
          className={styles.metrics}
          aria-label={t("common.loading")}
          role="status"
        >
          {["due", "pending", "unknown", "failed"].map((key) => (
            <Skeleton key={key} className={styles.metricSkeleton} />
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
        <div className={styles.metrics}>
          {cards.map((card) => (
            <Card key={card.key}>
              <CardBody className={styles.metricBody}>
                <div className={styles.metricLabel}>
                  <span>{t(`scheduleUi.health.${card.key}.label`)}</span>
                  <HelpPopover label={t(`scheduleUi.health.${card.key}.label`)}>
                    {t(`scheduleUi.health.${card.key}.description`)}
                  </HelpPopover>
                </div>
                <strong className={card.alert ? styles.warning : undefined}>
                  {card.value}
                </strong>
                <span className={styles.metricDetail}>{card.detail}</span>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
