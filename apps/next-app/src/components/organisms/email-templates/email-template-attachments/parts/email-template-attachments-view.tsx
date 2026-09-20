"use client";
import { FileText, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  FileUploader,
  FormMessage,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";

import type { AttachedFile } from "../types/email-template-attachments.types";

interface Props {
  files: AttachedFile[];
  pending: File[];
  onFilesChange: (files: File[]) => void;
  onUploadSelected: (files: File[]) => Promise<void>;
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

export function EmailTemplateAttachmentsView({
  files,
  pending,
  onFilesChange,
  onUploadSelected,
  onRemove,
  disabled,
  error,
}: Props) {
  const t = useTranslation();
  return (
    <Card>
      <CardBody>
        <section className="grid gap-4">
          <div>
            <h2 className="text-[17px] text-[var(--np-ink)]">
              {t("emailTemplates.attachments")}
            </h2>
            <p className="mt-1 text-xs text-[var(--np-muted)]">
              {t("emailTemplates.attachmentHint")}
            </p>
          </div>
          <FileUploader
            files={pending}
            onFilesChange={onFilesChange}
            onUpload={onUploadSelected}
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
            <ul className="m-0 grid list-none gap-2 p-0">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[9px] border border-[var(--np-border)] px-[11px] py-[9px]"
                >
                  <FileText size={18} aria-hidden="true" />
                  <div className="grid min-w-0">
                    <strong className="truncate text-[13px]">
                      {file.name}
                    </strong>
                    <span className="text-[11px] text-[var(--np-muted)]">
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
