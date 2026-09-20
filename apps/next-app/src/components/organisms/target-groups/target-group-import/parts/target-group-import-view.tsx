"use client";
import { Button, Dialog, FormMessage } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { TargetGroupImportForm } from "./target-group-import-form";
import { TargetGroupImportResult } from "./target-group-import-result";
import type { ImportProgress } from "../types/import-types";
interface Props {
  visible: boolean;
  onHide: () => void;
  step: "configure" | "importing" | "done";
  busy: boolean;
  error: string;
  jobError: boolean;
  onRetryJob: () => void;
  resultStatus: "importing" | "completed" | "failed";
  progress: ImportProgress | null;
}
export function TargetGroupImportView(props: Props) {
  const t = useTranslation();
  const footer =
    props.step === "configure" ? (
      <>
        <Button
          variant="secondary"
          disabled={props.busy}
          onClick={props.onHide}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          form="target-group-import-form"
          disabled={props.busy}
          loading={props.busy}
        >
          {t("targetGroups.importStart")}
        </Button>
      </>
    ) : (
      <Button disabled={props.busy} onClick={props.onHide}>
        {t("targetGroups.importDone")}
      </Button>
    );
  return (
    <Dialog
      open={props.visible}
      onOpenChange={(open) => {
        if (!open && !props.busy) props.onHide();
      }}
      title={t("targetGroups.importTitle")}
      description={t("targetGroups.importSubtitle")}
      closeLabel={t("common.close")}
      dismissible={!props.busy}
      footer={footer}
    >
      {props.step === "configure" ? (
        <TargetGroupImportForm disabled={props.busy} />
      ) : props.jobError ? (
        <div className="grid gap-3">
          <FormMessage variant="error">
            {t("targetGroups.importJobError")}
          </FormMessage>
          <Button variant="secondary" onClick={props.onRetryJob}>
            {t("tableUi.retry")}
          </Button>
        </div>
      ) : (
        <TargetGroupImportResult
          status={props.resultStatus}
          progress={props.progress}
        />
      )}
      {props.error && <FormMessage variant="error">{props.error}</FormMessage>}
    </Dialog>
  );
}
