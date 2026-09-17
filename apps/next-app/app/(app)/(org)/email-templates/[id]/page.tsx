"use client";

import { useParams } from "next/navigation";
import EmailTemplateFormContainer from "@/src/components/organisms/email-templates";

export default function EmailTemplateEditorPage() {
  const params = useParams<{ id: string }>();
  return <EmailTemplateFormContainer templateId={params.id} />;
}
