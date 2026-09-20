"use client";

import { Button, Skeleton } from "@next-phish/ui";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

export function SendingProfileFormLoading({ t }: { t: TranslationFunction }) {
  return (
    <div
      role="status"
      aria-label={t("common.loading")}
      className="grid gap-[18px]"
    >
      <Skeleton style={{ width: "36%", height: 32 }} />
      <Skeleton style={{ width: "100%", height: 460, borderRadius: 12 }} />
    </div>
  );
}

export function SendingProfileFormError({
  t,
  onRetry,
}: {
  t: TranslationFunction;
  onRetry: () => void;
}) {
  return (
    <div role="alert">
      {t("sendingProfiles.loadError")}{" "}
      <Button type="button" variant="secondary" onClick={onRetry}>
        {t("tableUi.retry")}
      </Button>
    </div>
  );
}

export function SendingProfileFormNotFound({ t }: { t: TranslationFunction }) {
  return <p role="status">{t("sendingProfiles.notFound")}</p>;
}
