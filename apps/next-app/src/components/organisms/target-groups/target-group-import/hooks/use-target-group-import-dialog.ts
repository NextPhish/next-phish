"use client";

import { useEffect, useRef } from "react";
import type { FormikErrors, FormikProps } from "formik";
import { importTargetGroupUsersSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import {
  encodeImportFile,
  useTargetGroupImport,
} from "./use-target-group-import";
import type { ImportConfigValues, ImportProgress } from "../types/import-types";

const importModeSchema = importTargetGroupUsersSchema.pick({ mode: true });
export const initialImportValues: ImportConfigValues = {
  mode: "insert",
  file: null,
};

export function useTargetGroupImportDialog(
  targetGroupId: string,
  onHide: () => void,
) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const importState = useTargetGroupImport();
  const { state } = importState;
  const { status, setError, reset: resetStatus } = useFormStatus();
  const upload = trpc.file.uploadFile.useMutation();
  const start = trpc.targetGroup.importUsers.useMutation();
  const job = trpc.job.getById.useQuery(
    { id: state.jobId ?? "" },
    {
      enabled: Boolean(state.jobId),
      refetchInterval: (query) => {
        const current = query.state.data?.status;
        return current === "COMPLETED" || current === "FAILED" ? false : 5000;
      },
    },
  );
  const jobStatus = job.data?.status;
  const step: "configure" | "importing" | "done" = !state.jobId
    ? "configure"
    : jobStatus === "COMPLETED" || jobStatus === "FAILED"
      ? "done"
      : "importing";
  const invalidated = useRef<string | null>(null);
  useEffect(() => {
    if (state.jobId && step === "done" && invalidated.current !== state.jobId) {
      invalidated.current = state.jobId;
      void utils.targetGroup.invalidate();
    }
  }, [state.jobId, step, utils.targetGroup]);

  function validate(values: ImportConfigValues) {
    const errors: FormikErrors<ImportConfigValues> = {};
    if (!importModeSchema.safeParse({ mode: values.mode }).success)
      errors.mode = t("targetGroups.importMode");
    // The schema expects an uploaded id; FileUploader validates the browser File.
    if (!values.file || !values.file.name)
      errors.file = t("targetGroups.fileRequired");
    return errors;
  }

  async function handleImport(values: ImportConfigValues) {
    if (!values.file) return;
    resetStatus();
    importState.setUploading(true);
    try {
      const file = values.file;
      const uploaded = await upload.mutateAsync({
        name: file.name,
        size: file.size,
        format: file.type || "application/octet-stream",
        purpose: "IMPORT",
        data: await encodeImportFile(file),
      });
      const result = await start.mutateAsync({
        targetGroupId,
        mode: values.mode,
        fileId: uploaded.id,
        fileName: file.name,
      });
      importState.setJobId(result.jobId);
    } catch {
      setError(t("targetGroups.importError"));
    } finally {
      importState.setUploading(false);
    }
  }

  function viewProps(formik: FormikProps<ImportConfigValues>) {
    const busy =
      state.uploading ||
      upload.isPending ||
      start.isPending ||
      formik.isSubmitting;
    return {
      step,
      busy,
      error: status.type === "error" ? status.message : "",
      jobError: Boolean(job.error),
      onRetryJob: () => void job.refetch?.(),
      resultStatus:
        jobStatus === "COMPLETED"
          ? ("completed" as const)
          : jobStatus === "FAILED"
            ? ("failed" as const)
            : ("importing" as const),
      progress: (job.data?.progress ?? null) as ImportProgress | null,
      onHide: () => {
        if (busy) return;
        importState.reset();
        formik.resetForm();
        resetStatus();
        onHide();
      },
    };
  }

  return { validate, handleImport, viewProps };
}
