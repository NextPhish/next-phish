"use client";

import { useAttachmentUploads } from "./hooks/use-attachment-uploads";
import { EmailTemplateAttachmentsView } from "./parts/email-template-attachments-view";
import type { AttachedFile } from "./types/email-template-attachments.types";

interface Props {
  files: AttachedFile[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  disabled?: boolean;
  error?: string;
}

export function EmailTemplateAttachments(props: Props) {
  const uploads = useAttachmentUploads(props.onUpload);
  return <EmailTemplateAttachmentsView {...props} {...uploads} />;
}
