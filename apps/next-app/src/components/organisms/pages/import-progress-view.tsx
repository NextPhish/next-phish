"use client";

interface ImportProgressViewProps {
  progress: {
    status: string;
    discovered: number;
    downloaded: number;
    failed: number;
  } | null;
  t: (key: string) => string;
}

export function ImportProgressView({ progress, t }: ImportProgressViewProps) {
  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-[var(--np-ink)]">
        {t("pages.importProgress")}
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--np-border)]"
        role="progressbar"
        aria-label={t("pages.importProgress")}
      >
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--np-primary)]" />
      </div>

      {progress && (
        <div className="space-y-2 text-sm text-[var(--np-muted)]">
          <p>
            {progress.discovered > 0
              ? t("pages.importDownloadingAssets")
              : t("pages.importFetchingHtml")}
          </p>
          {progress.discovered > 0 && (
            <p>
              {t("pages.importAssetsFetched")
                .replace("{downloaded}", String(progress.downloaded))
                .replace("{total}", String(progress.discovered))}
              {progress.failed > 0 && (
                <span className="text-amber-400">
                  {" "}
                  (
                  {t("pages.failedAssets").replace(
                    "{count}",
                    String(progress.failed),
                  )}
                  )
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
