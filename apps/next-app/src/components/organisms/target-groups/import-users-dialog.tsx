"use client";

import { useEffect, useRef } from "react";
import { Formik, type FormikErrors } from "formik";
import { importTargetGroupUsersSchema } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import {
  encodeImportFile,
  useTargetGroupImport,
} from "@/src/hooks/use-target-group-import";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import {
  ImportUsersPresentation,
  type ImportProgress,
} from "./import-users-presentation";

interface Props {
  visible: boolean;
  onHide: () => void;
  targetGroupId: string;
}

export interface ImportConfigValues {
  mode: "insert" | "upsert";
  file: File | null;
}

const initialValues: ImportConfigValues = { mode: "insert", file: null };
const importModeSchema = importTargetGroupUsersSchema.pick({ mode: true });

export function ImportUsersDialog({ visible, onHide, targetGroupId }: Props) {
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
  const step = !state.jobId
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
    if (!importModeSchema.safeParse({ mode: values.mode }).success) {
      errors.mode = t("targetGroups.importMode");
    }
    // The schema's file field is an uploaded id, not a browser File.
    // FileUploader enforces the selected file's format, size, and count.
    if (!values.file || !values.file.name) {
      errors.file = t("targetGroups.fileRequired");
    }
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

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleImport}
    >
      {(formik) => {
        const busy =
          state.uploading ||
          upload.isPending ||
          start.isPending ||
          formik.isSubmitting;
        const close = () => {
          if (busy) return;
          importState.reset();
          formik.resetForm();
          resetStatus();
          onHide();
        };
        return (
          <ImportUsersPresentation
            visible={visible}
            onHide={close}
            step={step}
            busy={busy}
            error={status.type === "error" ? status.message : ""}
            jobError={Boolean(job.error)}
            onRetryJob={() => void job.refetch?.()}
            resultStatus={
              jobStatus === "COMPLETED"
                ? "completed"
                : jobStatus === "FAILED"
                  ? "failed"
                  : "importing"
            }
            progress={(job.data?.progress ?? null) as ImportProgress | null}
          />
        );
      }}
    </Formik>
  );
}
