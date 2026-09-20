"use client";

import { useCallback, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import { PageFormSkeleton } from "./parts/page-form-skeleton";
import { PageNotFound } from "./parts/page-not-found";
import { usePageEditor } from "./hooks/use-page-editor";
import { PageFormView } from "./parts/page-form-view";
import { Formik } from "formik";
import { createPageSchema } from "@next-phish/shared";
import { localizedPageValidation } from "./pages-validation";
import { ImportWebsite } from "../import-website";

interface PageFormProps {
  pageId?: string;
}

export function PageForm({ pageId }: PageFormProps) {
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const {
    data,
    isLoading,
    notFound,
    initialValues,
    editorHtmlRef,
    editorDesignRef,
    status,
    handleSubmit,
    regeneratePreview,
    isGeneratingPreview,
    t,
    router,
  } = usePageEditor({ pageId });

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

  const formInitialValues = {
    name: initialValues.name,
    path: initialValues.path,
    type: initialValues.type,
    status: initialValues.status,
    redirectTarget: (() => {
      if (initialValues.redirectPageId) return "page" as const;
      if (initialValues.redirectUrl) return "url" as const;
      return "none" as const;
    })(),
    redirectPageId: initialValues.redirectPageId,
    redirectUrl: initialValues.redirectUrl,
  };

  if (pageId && isLoading) {
    return <PageFormSkeleton />;
  }

  if (notFound) {
    return <PageNotFound message={t("pages.notFound")} />;
  }

  async function handleFormSubmit(values: {
    name: string;
    path: string | null;
    type: "LANDING" | "REDIRECT";
    status: "DRAFT" | "ACTIVE";
    redirectTarget: "none" | "page" | "url";
    redirectPageId: string | null;
    redirectUrl: string | null;
  }) {
    await handleSubmit({
      name: values.name,
      path: values.path,
      type: values.type,
      status: values.status,
      redirectUrl: values.redirectTarget === "url" ? values.redirectUrl : null,
      redirectPageId:
        values.redirectTarget === "page" ? values.redirectPageId : null,
    });
  }

  return (
    <Formik
      initialValues={formInitialValues}
      enableReinitialize
      validate={localizedPageValidation(createPageSchema, t)}
      onSubmit={handleFormSubmit}
    >
      <>
        <PageFormView
          pageId={pageId}
          status={status}
          editorHtmlRef={editorHtmlRef}
          editorDesignRef={editorDesignRef}
          initialDesign={data?.design as object | undefined}
          initialHtml={data?.html}
          t={t}
          onCancel={() => router.push("/pages")}
          onRegeneratePreview={regeneratePreview ?? undefined}
          isGeneratingPreview={isGeneratingPreview}
          onEditorRef={handleEditorRef}
          onImportRequest={() => setImportDialogVisible(true)}
        />
        <ImportWebsite
          visible={importDialogVisible}
          t={t}
          onImportComplete={handleImportComplete}
          onHide={() => setImportDialogVisible(false)}
        />
      </>
    </Formik>
  );
}
