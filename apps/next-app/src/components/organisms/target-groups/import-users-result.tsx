"use client";
import { Badge } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import type { ImportProgress } from "./import-users-presentation";
import { ImportStatsGrid } from "./import-stats-grid";
interface Props {
  status: "importing" | "completed" | "failed";
  progress: ImportProgress | null;
}
export function ImportUsersResult({ status, progress }: Props) {
  const t = useTranslation();
  const percentage = progress?.total
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Badge
          tone={
            status === "completed"
              ? "success"
              : status === "failed"
                ? "danger"
                : "info"
          }
        >
          {status === "completed" ? "✓" : status === "failed" ? "!" : "…"}
        </Badge>
        <p className="font-medium text-[var(--np-ink)]">
          {t(
            status === "completed"
              ? "targetGroups.importComplete"
              : status === "failed"
                ? "targetGroups.importFailed"
                : "targetGroups.importProgress",
          )}
        </p>
      </div>
      {status === "importing" && (
        <div
          role="progressbar"
          aria-label={t("targetGroups.importProgress")}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-[var(--np-border)]"
        >
          <div
            className="h-full bg-[var(--np-primary)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {progress && (
        <ImportStatsGrid
          total={progress.total}
          processed={progress.processed}
          inserted={progress.inserted}
          updated={progress.updated}
          skipped={progress.skipped}
          errors={progress.errors}
        />
      )}
      {progress?.validationErrors?.length ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold">
            {t("targetGroups.importValidationErrors")}
          </h3>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--np-border)] p-3">
            {progress.validationErrors.map((error) => (
              <p
                key={JSON.stringify([error.row, error.field, error.message])}
                className="text-sm text-[var(--np-danger)]"
              >
                {t("targetGroups.rowError", {
                  row: error.row,
                  field: error.field,
                  message: error.message,
                })}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
