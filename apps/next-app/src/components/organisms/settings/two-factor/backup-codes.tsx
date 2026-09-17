"use client";

import { Download } from "lucide-react";
import { Button } from "@next-phish/ui";
import { useTranslation, type TranslationFunction } from "../../../../lib/i18n";
import styles from "../profile-settings.module.css";

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
    <div className={styles.backupPanel}>
      <div>
        <strong>{t("settings.backupCodes")}</strong>
        <p>{t("settings.backupCodesHint")}</p>
      </div>
      <div className={styles.codeGrid}>
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
