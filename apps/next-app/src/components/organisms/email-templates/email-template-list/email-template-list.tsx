"use client";

import { useEmailTemplateList } from "./hooks/use-email-template-list";
import { EmailTemplateListView } from "./parts/email-template-list-view";

export function EmailTemplateList() {
  return <EmailTemplateListView {...useEmailTemplateList()} />;
}
