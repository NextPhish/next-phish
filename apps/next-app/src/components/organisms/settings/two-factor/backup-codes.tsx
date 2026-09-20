"use client";

import { Download } from "lucide-react";
import { Button } from "@next-phish/ui";
import { useTranslation, type TranslationFunction } from "../../../../lib/i18n";

function downloadBackupCodes(codes: string[], t: TranslationFunction) {
  const content = [
    t("settings.backupCodesFileTitle"),
    "========================",
    "",
    t("settings.backupCodesFileHint"),
    "",
    ...codes,
    "",
    t("settings.generatedAt", { date: new Date().toISOString() }),
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nextphish-backup-codes.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BackupCodes({ codes }: { codes: string[] }) {
  const t = useTranslation();
  return (
    <div className="grid gap-3 rounded-[10px] border border-[var(--np-border)] p-4 [&_strong]:block [&_strong]:text-sm [&_strong]:font-[650] [&_p]:mt-1 [&_p]:text-xs [&_p]:leading-6 [&_p]:text-[var(--np-muted)]">
      <div>
        <strong>{t("settings.backupCodes")}</strong>
        <p>{t("settings.backupCodesHint")}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-[7px] rounded-lg bg-[var(--np-tint)] p-3 [&_code]:text-xs [&_code]:tracking-[0.08em] [&_code]:text-[var(--np-ink)]">
        {codes.map((code) => (
          <code key={code}>{code}</code>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => downloadBackupCodes(codes, t)}
      >
        <Download size={16} aria-hidden="true" />
        {t("settings.downloadBackupCodes")}
      </Button>
    </div>
  );
}
