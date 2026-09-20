"use client";
import { useTranslation } from "@/src/lib/i18n/client";
interface Props {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}
export function TargetGroupImportStats(props: Props) {
  const t = useTranslation();
  const fields = [
    { key: "total", value: props.total },
    { key: "processed", value: props.processed },
    { key: "inserted", value: props.inserted },
    { key: "updated", value: props.updated },
    { key: "skipped", value: props.skipped },
    { key: "errors", value: props.errors },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      {fields
        .filter(
          (item) =>
            (item.key !== "total" &&
              item.key !== "processed" &&
              item.key !== "skipped") ||
            item.value > 0,
        )
        .map(({ key, value }) => (
          <div
            key={key}
            className="rounded-lg border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-3"
          >
            <dt className="text-[var(--np-muted)]">
              {t(`targetGroups.import${key[0]!.toUpperCase()}${key.slice(1)}`)}
            </dt>
            <dd className="font-semibold text-[var(--np-ink)]">{value}</dd>
          </div>
        ))}
    </dl>
  );
}
