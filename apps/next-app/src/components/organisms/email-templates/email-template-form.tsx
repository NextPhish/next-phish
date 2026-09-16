"use client";
import type { ReactNode } from "react";
import { Form, useFormikContext } from "formik";
import { Image as ImageIcon } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  FormErrorSummary,
  FormField,
  FormMessage,
  HelpPopover,
  Input,
  PageHeader,
  Select,
  TagInput,
} from "@next-phish/ui";
import type { FormStatus } from "@/src/hooks/use-form-status";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import {
  FileAttachmentPanel,
  type AttachedFile,
} from "./file-attachment-panel";
import { TemplateVariablePanel } from "./template-variable-panel";
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
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    setFieldValue,
    handleChange,
    handleBlur,
  } = useFormikContext<EmailTemplateFormValues>();
  const summaryErrors =
    submitCount > 0
      ? [
          typeof errors.name === "string"
            ? { id: "email-template-name", message: errors.name }
            : null,
          typeof errors.tags === "string"
            ? { id: "email-template-tags", message: errors.tags }
            : null,
          typeof errors.status === "string"
            ? { id: "email-template-status", message: errors.status }
            : null,
        ].filter((item): item is { id: string; message: string } =>
          Boolean(item),
        )
      : [];
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
      <Form className={styles.form}>
        <div className={styles.main}>
          <FormErrorSummary
            title={t("emailTemplates.validationSummary")}
            errors={summaryErrors}
          />
          <Card>
            <CardBody>
              <div className={styles.fields}>
                <FormField
                  id="email-template-name"
                  label={t("emailTemplates.name")}
                  required
                  error={touched.name ? errors.name : undefined}
                >
                  {(control) => (
                    <Input
                      {...control}
                      name="name"
                      value={values.name}
                      placeholder={t("emailTemplates.namePlaceholder")}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}
                </FormField>
                <FormField
                  id="email-template-tags"
                  label={t("emailTemplates.tags")}
                  error={
                    touched.tags && typeof errors.tags === "string"
                      ? errors.tags
                      : undefined
                  }
                >
                  {(control) => (
                    <TagInput
                      {...control}
                      value={values.tags}
                      onValueChange={(next) =>
                        setFieldValue("tags", next, true)
                      }
                      placeholder={t("emailTemplates.tagsPlaceholder")}
                      aria-label={t("emailTemplates.addTag")}
                      labels={{
                        tags: t("emailTemplates.selectedTags"),
                        remove: (tag) => t("emailTemplates.removeTag", { tag }),
                      }}
                    />
                  )}
                </FormField>
                <FormField
                  id="email-template-status"
                  label={t("emailTemplates.status")}
                  required
                >
                  {(control) => (
                    <Select
                      {...control}
                      value={values.status}
                      options={[
                        { value: "DRAFT", label: t("common.draft") },
                        { value: "ACTIVE", label: t("common.active") },
                      ]}
                      onValueChange={(next) => setFieldValue("status", next)}
                    />
                  )}
                </FormField>
                <div className={styles.checkField}>
                  <Checkbox
                    id="trackingPixel"
                    checked={values.trackingPixel}
                    onCheckedChange={(checked) =>
                      setFieldValue("trackingPixel", checked === true)
                    }
                  />
                  <label htmlFor="trackingPixel">
                    {t("emailTemplates.trackingPixel")}
                  </label>
                  <HelpPopover label={t("emailTemplates.trackingPixelHelp")}>
                    <p>{t("emailTemplates.trackingPixelHint")}</p>
                  </HelpPopover>
                </div>
              </div>
            </CardBody>
          </Card>
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
