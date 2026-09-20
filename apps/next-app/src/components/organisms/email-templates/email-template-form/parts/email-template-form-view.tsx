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
  EmailTemplateAttachments,
  type AttachedFile,
} from "../../email-template-attachments";
import { TemplateVariablePanel } from "../../template-variable-panel";
import {
  EmailTemplateFields,
  EmailTemplateErrorSummary,
} from "./email-template-fields";

import type { EmailTemplateFormValues } from "../types/email-template-form.types";

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

export function EmailTemplateFormView({
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
    <div className="grid min-w-0 gap-6">
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
      <Form
        noValidate
        className="grid min-w-0 items-start gap-6 min-[981px]:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]"
      >
        <div className="grid min-w-0 gap-5">
          <EmailTemplateErrorSummary t={t} />
          <EmailTemplateFields t={t} />
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[17px] text-[var(--np-ink)]">
                {t("emailTemplates.editorLabel")}
              </h2>
              <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--np-muted)]">
                GrapesJS
              </span>
            </div>
            <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--np-border)] bg-white">
              {editor}
            </div>
          </section>
          <EmailTemplateAttachments
            files={attachedFiles}
            onUpload={onUpload}
            onRemove={onRemove}
            disabled={uploading}
            error={attachmentError}
          />
        </div>
        <aside className="grid min-w-0 gap-5 min-[981px]:sticky min-[981px]:top-5">
          <TemplateVariablePanel />
          <Card>
            <CardBody>
              <div className="mb-3 grid gap-2.5">
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
