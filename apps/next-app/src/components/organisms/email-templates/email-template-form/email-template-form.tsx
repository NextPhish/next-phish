"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@next-phish/ui";
import { Formik } from "formik";
import { useEmailTemplateEditor } from "./hooks/use-email-template-editor";
import { useAttachmentManager } from "./hooks/use-attachment-manager";
import { EmailTemplateFormView } from "./parts/email-template-form-view";
import type { EmailTemplateFormValues } from "./types/email-template-form.types";
import { emailTemplateFormValidator } from "./email-template-form-validation";

const GrapesEditor = dynamic(
  () =>
    import("@/src/components/organisms/grapes-editor/grapes-editor").then(
      (module) => module.GrapesEditor,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[720px] w-full rounded-xl" />,
  },
);

interface EmailTemplateFormProps {
  templateId?: string;
}

export function EmailTemplateForm({ templateId }: EmailTemplateFormProps) {
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
        className="grid min-w-0 gap-5"
      >
        <Skeleton style={{ width: "42%", height: 32 }} />
        <Skeleton style={{ width: "100%", height: 700, borderRadius: 12 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div role="status" className="text-[var(--np-muted)]">
        {t("emailTemplates.notFound")}
      </div>
    );
  }

  async function handleFormSubmit(values: EmailTemplateFormValues) {
    if (uploading) {
      setError(t("emailTemplates.attachmentError"));
      return;
    }
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
      <EmailTemplateFormView
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
