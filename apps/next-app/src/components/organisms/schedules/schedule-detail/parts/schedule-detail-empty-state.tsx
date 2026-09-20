"use client";

import { AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";

export function ScheduleDetailEmptyState({
  failed,
  onRetry,
}: {
  failed: boolean;
  onRetry: () => void;
}) {
  const t = useTranslation();
  const error = failed;
  return (
    <div className="px-6 py-16">
      <EmptyState
        icon={<AlertTriangle size={24} />}
        title={error ? t("scheduleUi.loadFailed") : t("scheduleUi.notFound")}
        description={error ? t("scheduleUi.loadFailedHint") : undefined}
        action={
          error ? (
            <Button variant="secondary" onClick={onRetry}>
              {t("tableUi.retry")}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
