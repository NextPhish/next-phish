"use client";

import { useCallback, useRef, useState } from "react";
import { Form, useFormikContext } from "formik";
import {
  Button,
  FormErrorSummary,
  FormMessage,
  PageHeader,
} from "@next-phish/ui";
import { ImportWebsiteDialog } from "./import-website-dialog";
import { PageNameField } from "./page-name-field";
import { PageEditorSection } from "./page-editor-section";
import { PageSettingsFields } from "./page-settings-fields";
import type { Editor } from "grapesjs";
import type { FormStatus } from "@/src/hooks/use-form-status";

export interface PageFormValues {
  name: string;
  path: string | null;
  type: "LANDING" | "REDIRECT";
  status: "DRAFT" | "ACTIVE";
  redirectTarget: "none" | "page" | "url";
  redirectPageId: string | null;
  redirectUrl: string | null;
}

interface PageFormProps {
  pageId?: string;
  status: FormStatus;
  editorHtmlRef: React.MutableRefObject<string>;
  editorDesignRef: React.MutableRefObject<unknown>;
  initialDesign?: object;
  initialHtml?: string;
  t: (key: string) => string;
  onCancel: () => void;
  onRegeneratePreview?: () => Promise<void>;
  isGeneratingPreview?: boolean;
}

export function PageForm({
  pageId,
  status,
  editorHtmlRef,
  editorDesignRef,
  initialDesign,
  initialHtml,
  t,
  onCancel,
  onRegeneratePreview,
  isGeneratingPreview,
}: PageFormProps) {
  const { isSubmitting, values, setFieldValue, errors, submitCount } =
    useFormikContext<PageFormValues>();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  const handleImportComplete = useCallback(
    (html: string) => {
      editorHtmlRef.current = html;
      editorRef.current?.setComponents(html);
    },
    [editorHtmlRef],
  );

  const handleEditorRef = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  return (
    <div className="grid min-w-0 gap-6 text-[var(--np-ink)]">
      <PageHeader
        title={pageId ? t("pages.editPage") : t("pages.createTitle")}
        description={
          pageId ? t("pages.editSubtitle") : t("pages.createSubtitle")
        }
      />
      <Form className="space-y-6">
        {submitCount > 0 && (
          <FormErrorSummary
            title={t("pages.validationSummary")}
            errors={Object.entries(errors).flatMap(([field, message]) =>
              typeof message === "string"
                ? [{ id: field === "name" ? "name" : `page-${field}`, message }]
                : [],
            )}
          />
        )}
        <div className="grid gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageNameField t={t} />

            <PageEditorSection
              pageId={pageId}
              initialDesign={initialDesign}
              initialHtml={initialHtml}
              editorHtmlRef={editorHtmlRef}
              editorDesignRef={editorDesignRef}
              onEditorRef={handleEditorRef}
              t={t}
            />

            {values.type === "LANDING" && (
              <div>
                <Button
                  type="button"
                  onClick={() => setImportDialogVisible(true)}
                  variant="secondary"
                >
                  {t("pages.importWebsite")}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="np-card sticky top-3 p-5">
              <PageSettingsFields
                pageId={pageId}
                values={values}
                setFieldValue={setFieldValue}
                t={t}
              />

              <div className="flex flex-col gap-3">
                {pageId && onRegeneratePreview ? (
                  <Button
                    type="button"
                    loading={isGeneratingPreview}
                    onClick={() => void onRegeneratePreview()}
                    variant="secondary"
                  >
                    {t("pages.regeneratePreview")}
                  </Button>
                ) : null}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {pageId
                    ? t("pages.updatePage")
                    : values.status === "ACTIVE"
                      ? t("pages.savePage")
                      : t("pages.saveDraft")}
                </Button>
                <Button type="button" onClick={onCancel} variant="secondary">
                  {t("common.cancel")}
                </Button>
              </div>

              {status.type === "error" ? (
                <div className="mt-3">
                  <FormMessage variant="error">{status.message}</FormMessage>
                </div>
              ) : null}
              {status.type === "success" ? (
                <div className="mt-3">
                  <FormMessage variant="success">{status.message}</FormMessage>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </Form>
      <ImportWebsiteDialog
        visible={importDialogVisible}
        t={t}
        onImportComplete={handleImportComplete}
        onHide={() => setImportDialogVisible(false)}
      />
    </div>
  );
}
