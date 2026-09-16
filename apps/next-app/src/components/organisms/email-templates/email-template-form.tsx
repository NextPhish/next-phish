"use client";
import type { ReactNode } from "react";
import { Form, useFormikContext } from "formik";
import { Image as ImageIcon } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  FormMessage,
  PageHeader,
} from "@next-phish/ui";
import type { FormStatus } from "@/src/hooks/use-form-status";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import {
  FileAttachmentPanel,
  type AttachedFile,
} from "./file-attachment-panel";
import { TemplateVariablePanel } from "./template-variable-panel";
import {
  EmailTemplateFields,
  EmailTemplateErrorSummary,
} from "./email-template-fields";
import styles from "./email-template-form.module.css";

export interface EmailTemplateFormValues {
  name: string;
  tags: string[];
  status: "DRAFT" | "ACTIVE";
  trackingPixel: boolean;
}
interface Props {
  templateId?: string;
  attachedFiles: AttachedFile[];
  uploading: boolean;
  attachmentError?: string;
  status: FormStatus;
  editor: ReactNode;
  t: TranslationFunction;
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  onCancel: () => void;
  onRegeneratePreview?: () => Promise<void>;
  isGeneratingPreview?: boolean;
}

export function EmailTemplateForm({
  templateId,
  attachedFiles,
  uploading,
  attachmentError,
  status,
  editor,
  t,
  onUpload,
  onRemove,
  onCancel,
  onRegeneratePreview,
  isGeneratingPreview,
}: Props) {
  const { values, isSubmitting } = useFormikContext<EmailTemplateFormValues>();
  return (
    <div className={styles.formPage}>
      <PageHeader
        title={
          templateId
            ? t("emailTemplates.editTemplate")
            : t("emailTemplates.createTitle")
        }
        description={
          templateId
            ? t("emailTemplates.editSubtitle")
            : t("emailTemplates.createSubtitle")
        }
        actions={
          templateId && onRegeneratePreview ? (
            <Button
              variant="secondary"
              loading={isGeneratingPreview}
              onClick={() => void onRegeneratePreview()}
            >
              <ImageIcon size={16} aria-hidden="true" />
              {t("emailTemplates.regeneratePreview")}
            </Button>
          ) : undefined
        }
      />
      <Form noValidate className={styles.form}>
        <div className={styles.main}>
          <EmailTemplateErrorSummary t={t} />
          <EmailTemplateFields t={t} />
          <section className={styles.editorSection}>
            <div className={styles.sectionTitle}>
              <h2>{t("emailTemplates.editorLabel")}</h2>
              <span>GrapesJS</span>
            </div>
            <div className={styles.legacyEditor}>{editor}</div>
          </section>
          <FileAttachmentPanel
            files={attachedFiles}
            onUpload={onUpload}
            onRemove={onRemove}
            disabled={uploading}
            error={attachmentError}
          />
        </div>
        <aside className={styles.aside}>
          <TemplateVariablePanel />
          <Card>
            <CardBody>
              <div className={styles.actions}>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={uploading}
                >
                  {templateId
                    ? t("emailTemplates.updateTemplate")
                    : values.status === "ACTIVE"
                      ? t("emailTemplates.saveTemplate")
                      : t("emailTemplates.saveDraft")}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
              </div>
              {status.type === "error" && (
                <FormMessage variant="error">{status.message}</FormMessage>
              )}
              {status.type === "success" && (
                <FormMessage variant="success">{status.message}</FormMessage>
              )}
            </CardBody>
          </Card>
        </aside>
      </Form>
    </div>
  );
}
