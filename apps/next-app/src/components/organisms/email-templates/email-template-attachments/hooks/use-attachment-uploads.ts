import { useState } from "react";
import { useTranslation } from "@/src/lib/i18n";

export function useAttachmentUploads(onUpload: (file: File) => Promise<void>) {
  const t = useTranslation();
  const [pending, setPending] = useState<File[]>([]);

  async function onUploadSelected(selected: File[]) {
    const results = await Promise.allSettled(selected.map(onUpload));
    const failed = selected.filter(
      (_, index) => results[index].status === "rejected",
    );
    setPending(failed);
    if (failed.length) throw new Error(t("emailTemplates.uploadFailed"));
  }

  return { pending, onFilesChange: setPending, onUploadSelected };
}
