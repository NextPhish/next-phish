"use client";
import { useId, useReducer, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "../atoms/button";
import { FormMessage } from "./form-message";
import { validateFiles, fileKey } from "./file-uploader.validation";
export interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  label?: string;
  labels?: {
    hint: string;
    choose: string;
    upload: string;
    uploading: string;
    complete: string;
    failed: string;
    remove: (name: string) => string;
    type: (name: string) => string;
    size: (name: string) => string;
    count: (count: number) => string;
    summary?: (maxSizeKb: number, maxFiles?: number) => string;
  };
}
const defaults = {
  hint: "Choose files or drop them here",
  choose: "Choose files",
  upload: "Upload files",
  uploading: "Uploading files…",
  complete: "Files uploaded successfully.",
  failed: "Upload failed. Please try again.",
  remove: (name: string) => `Remove ${name}`,
  type: (name: string) => `${name}: unsupported file type.`,
  size: (name: string) => `${name}: file is too large.`,
  count: (count: number) => `Choose up to ${count} files.`,
};
type UploadState = {
  status: "idle" | "uploading" | "success" | "error";
  errors: string[];
  dragging: boolean;
};
export function FileUploader({
  files,
  onFilesChange,
  onUpload,
  accept,
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 5,
  disabled,
  id,
  label = "Attachments",
  labels = defaults,
  ...aria
}: FileUploaderProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const [state, update] = useReducer(
    (old: UploadState, patch: Partial<UploadState>) => ({ ...old, ...patch }),
    { status: "idle", errors: [], dragging: false },
  );
  const busy = disabled || state.status === "uploading";
  function add(incoming: File[]) {
    if (busy) return;
    const result = validateFiles(
      incoming,
      files,
      { accept, maxFileSize, maxFiles },
      labels,
    );
    onFilesChange(result.files);
    update({
      errors: result.errors,
      status: result.errors.length ? "error" : "idle",
      dragging: false,
    });
  }
  async function upload() {
    if (!onUpload || inFlight.current || !files.length) return;
    inFlight.current = true;
    update({ status: "uploading", errors: [] });
    try {
      await onUpload(files);
      update({ status: "success" });
    } catch {
      update({ status: "error", errors: [labels.failed] });
    } finally {
      inFlight.current = false;
    }
  }
  return (
    <div className="np-file-uploader">
      <div
        className="np-file-drop"
        data-dragging={state.dragging}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) update({ dragging: true });
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            update({ dragging: false });
        }}
        onDrop={(event) => {
          event.preventDefault();
          add(Array.from(event.dataTransfer.files));
        }}
      >
        <Upload size={25} aria-hidden="true" />
        <label htmlFor={inputId}>{label}</label>
        <p>{labels.hint}</p>
        <input
          {...aria}
          ref={input}
          id={inputId}
          className="np-sr-only"
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          disabled={busy}
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {labels.choose}
        </Button>
        <p>
          {labels.summary ? (
            labels.summary(
              Math.max(1, Math.round(maxFileSize / 1024)),
              Number.isFinite(maxFiles) ? maxFiles : undefined,
            )
          ) : (
            <>
              {accept ?? "All file types"} · Max{" "}
              {Math.max(1, Math.round(maxFileSize / 1024))} KB / file
              {Number.isFinite(maxFiles) ? ` · ${maxFiles} files` : ""}
            </>
          )}
        </p>
      </div>
      {files.length > 0 && (
        <ul className="np-file-list">
          {files.map((file) => (
            <li key={fileKey(file)}>
              <FileText size={18} aria-hidden="true" />
              <div>
                <strong>{file.name}</strong>
                <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                aria-label={labels.remove(file.name)}
                onClick={() => {
                  onFilesChange(
                    files.filter((item) => fileKey(item) !== fileKey(file)),
                  );
                  update({ status: "idle", errors: [] });
                }}
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {state.errors.length > 0 && (
        <FormMessage variant="error">
          <ul>
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </FormMessage>
      )}
      {state.status === "success" && (
        <FormMessage variant="success">{labels.complete}</FormMessage>
      )}
      {onUpload && (
        <Button
          disabled={busy || !files.length || state.status === "success"}
          loading={state.status === "uploading"}
          onClick={upload}
        >
          {state.status === "uploading" ? labels.uploading : labels.upload}
        </Button>
      )}
    </div>
  );
}
