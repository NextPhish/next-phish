"use client";
import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  FileUploader,
  FormMessage,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./file-attachment-panel.module.css";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  format: string;
}
interface Props {
  files: AttachedFile[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (fileId: string) => Promise<void>;
  disabled?: boolean;
  error?: string;
}
function formatSize(bytes: number) {
  return bytes >= 1_048_576
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : bytes >= 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${bytes} B`;
}
function formatType(format: string) {
  return (
    (
      {
        "application/pdf": "PDF",
        "application/zip": "ZIP",
        "image/png": "PNG",
        "image/jpeg": "JPG",
        "application/msword": "DOC",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          "DOCX",
        "application/vnd.ms-excel": "XLS",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "XLSX",
      } as Record<string, string>
    )[format] ??
    format.split("/").pop()?.toUpperCase() ??
    format
  );
}

export function FileAttachmentPanel({
  files,
  onUpload,
  onRemove,
  disabled,
  error,
}: Props) {
  const t = useTranslation();
  const [pending, setPending] = useState<File[]>([]);
  return (
    <Card>
      <CardBody>
        <section className={styles.panel}>
          <div>
            <h2>{t("emailTemplates.attachments")}</h2>
            <p>{t("emailTemplates.attachmentHint")}</p>
          </div>
          <FileUploader
            files={pending}
            onFilesChange={setPending}
            onUpload={async (selected) => {
              const results = await Promise.allSettled(selected.map(onUpload));
              const failed = selected.filter(
                (_, index) => results[index].status === "rejected",
              );
              setPending(failed);
              if (failed.length)
                throw new Error(t("emailTemplates.uploadFailed"));
            }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            maxFileSize={10_000_000}
            maxFiles={Number.POSITIVE_INFINITY}
            disabled={disabled}
            label={t("emailTemplates.uploadFile")}
            labels={{
              hint: t("emailTemplates.dragDropHint"),
              choose: t("emailTemplates.chooseFiles"),
              upload: t("emailTemplates.uploadFile"),
              uploading: t("emailTemplates.uploadingFile"),
              complete: t("emailTemplates.uploadSuccess"),
              failed: t("emailTemplates.uploadFailed"),
              remove: (name) => t("emailTemplates.removeNamedFile", { name }),
              type: (name) => t("emailTemplates.unsupportedFile", { name }),
              size: (name) => t("emailTemplates.fileTooLarge", { name }),
              count: (count) => t("emailTemplates.fileCount", { count }),
              summary: (size) => t("emailTemplates.fileRequirements", { size }),
            }}
          />
          {error && <FormMessage variant="error">{error}</FormMessage>}
          {files.length > 0 && (
            <ul className={styles.files}>
              {files.map((file) => (
                <li key={file.id}>
                  <FileText size={18} aria-hidden="true" />
                  <div>
                    <strong>{file.name}</strong>
                    <span>
                      {formatType(file.format)} · {formatSize(file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    aria-label={t("emailTemplates.removeNamedFile", {
                      name: file.name,
                    })}
                    onClick={() => void onRemove(file.id)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardBody>
    </Card>
  );
}
