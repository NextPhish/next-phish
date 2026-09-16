"use client";

import dynamic from "next/dynamic";
import styles from "./email-template-form.module.css";
import { Skeleton } from "@next-phish/ui";
import { Formik } from "formik";
import { useEmailTemplateEditor } from "@/src/hooks/use-email-template-editor";
import { useAttachmentManager } from "@/src/hooks/use-attachment-manager";
import {
  EmailTemplateForm,
  type EmailTemplateFormValues,
} from "./email-template-form";
import { emailTemplateFormValidator } from "./email-template-form-validation";

const GrapesEditor = dynamic(
  () =>
    import("@/src/components/organisms/grapes-editor/grapes-editor").then(
      (module) => module.GrapesEditor,
    ),
  { ssr: false, loading: () => <Skeleton className={styles.editorSkeleton} /> },
);

interface EmailTemplateFormContainerProps {
  templateId?: string;
}

export function EmailTemplateFormContainer({
  templateId,
}: EmailTemplateFormContainerProps) {
  const {
    data,
    isLoading,
    isLoadingFiles,
    notFound,
    initialValues,
    attachedFiles: initialAttachedFiles,
    editorHtmlRef,
    editorDesignRef,
    status,
    setError,
    handleSubmit,
    handleUploadFile,
    handleDeleteFile,
    regeneratePreview,
    isGeneratingPreview,
    t,
    router,
  } = useEmailTemplateEditor({ templateId });

  const {
    uploading,
    attachedFiles,
    handleUpload,
    handleRemove,
    error: attachmentError,
  } = useAttachmentManager({
    onUploadFile: handleUploadFile,
    onDeleteFile: handleDeleteFile,
    initialAttachedFiles,
    errorMessage: t("emailTemplates.attachmentError"),
  });

  const formInitialValues = {
    name: initialValues.name,
    tags: initialValues.tags,
    status: initialValues.status,
    trackingPixel: initialValues.trackingPixel,
  };

  if (templateId && (isLoading || isLoadingFiles)) {
    return (
      <div
        role="status"
        aria-label={t("emailTemplates.loadingEditor")}
        style={{ display: "grid", gap: 20, minWidth: 0 }}
      >
        <Skeleton style={{ width: "42%", height: 32 }} />
        <Skeleton style={{ width: "100%", height: 700, borderRadius: 12 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div role="status" style={{ color: "var(--np-muted)" }}>
        {t("emailTemplates.notFound")}
      </div>
    );
  }

  async function handleFormSubmit(values: EmailTemplateFormValues) {
    await handleSubmit({
      ...values,
      fileIds: attachedFiles.map((f) => f.id),
    });
  }

  return (
    <Formik<EmailTemplateFormValues>
      initialValues={formInitialValues}
      enableReinitialize
      validate={emailTemplateFormValidator(t)}
      onSubmit={handleFormSubmit}
    >
      <EmailTemplateForm
        templateId={templateId}
        attachedFiles={attachedFiles}
        uploading={uploading}
        attachmentError={attachmentError}
        status={status}
        editor={
          <GrapesEditor
            mode="email"
            key={templateId ?? "new"}
            initialDesign={data?.design as object}
            initialHtml={data?.html}
            onChange={({ html, design }) => {
              editorHtmlRef.current = html;
              editorDesignRef.current = design;
            }}
          />
        }
        t={t}
        onUpload={handleUpload}
        onRemove={handleRemove}
        onCancel={() => router.push("/email-templates")}
        onRegeneratePreview={
          regeneratePreview
            ? async () => {
                try {
                  await regeneratePreview();
                } catch {
                  setError(t("emailTemplates.previewError"));
                }
              }
            : undefined
        }
        isGeneratingPreview={isGeneratingPreview}
      />
    </Formik>
  );
}
