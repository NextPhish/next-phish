"use client";

import { PageFormSkeleton } from "./page-form-skeleton";
import { usePageEditor } from "@/src/hooks/use-page-editor";
import { PageForm } from "./page-form";
import { Formik } from "formik";
import { createPageSchema } from "@next-phish/shared";
import { localizedPageValidation } from "./pages-validation";

interface PageFormContainerProps {
  pageId?: string;
}

export function PageFormContainer({ pageId }: PageFormContainerProps) {
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
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[var(--np-muted)]">{t("pages.notFound")}</p>
      </div>
    );
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
      <PageForm
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
      />
    </Formik>
  );
}
