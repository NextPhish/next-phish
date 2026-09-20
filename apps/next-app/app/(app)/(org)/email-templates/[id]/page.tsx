"use client";

import { useParams } from "next/navigation";
import EmailTemplateForm from "@/src/components/organisms/email-templates";

export default function EmailTemplateEditorPage() {
  const params = useParams<{ id: string }>();
  return <EmailTemplateForm templateId={params.id} />;
}
