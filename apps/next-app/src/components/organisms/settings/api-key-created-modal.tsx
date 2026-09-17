"use client";
import { Check, Copy } from "lucide-react";
import { Dialog, Button, FormMessage } from "@next-phish/ui";
import { useFormStatus } from "../../../hooks/use-form-status";
import { useTranslation } from "../../../lib/i18n";
export function ApiKeyCreatedModal({
  apiKey,
  onHide,
}: {
  apiKey: string | null;
  onHide: () => void;
}) {
  const t = useTranslation();
  const { status, setError, setSuccess } = useFormStatus();
  async function copy() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setSuccess(t("apiKeys.copied"));
    } catch {
      setError(t("apiKeys.copyError"));
    }
  }
  return (
    <Dialog
      dismissible={false}
      title={t("apiKeys.keyCreated")}
      description={t("apiKeys.saveKeyHint")}
      open={!!apiKey}
      onOpenChange={(open) => {
        if (!open) onHide();
      }}
      closeLabel={t("apiKeys.done")}
      footer={
        <>
          <Button variant="secondary" onClick={() => void copy()}>
            {status.type === "success" ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {t(
              status.type === "success" ? "apiKeys.copied" : "apiKeys.copyKey",
            )}
          </Button>
          <Button onClick={onHide}>{t("apiKeys.done")}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormMessage variant="info" title={t("apiKeys.saveKeyWarning")}>
          {t("apiKeys.saveKeyHint")}
        </FormMessage>
        <div className="rounded-lg border border-ui-border bg-ui-background p-4">
          <p className="mb-2 text-xs font-semibold text-ui-muted">
            {t("apiKeys.yourApiKey")}
          </p>
          <code className="block break-all text-sm text-ui-ink">{apiKey}</code>
        </div>
        {status.type === "error" && (
          <FormMessage variant="error">{status.message}</FormMessage>
        )}
      </div>
    </Dialog>
  );
}
