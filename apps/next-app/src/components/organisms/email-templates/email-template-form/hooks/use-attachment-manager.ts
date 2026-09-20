"use client";

import { useReducer } from "react";
import type { AttachedFile } from "../../email-template-attachments/types/email-template-attachments.types";

interface UseAttachmentManagerOptions {
  onUploadFile: (
    file: File,
  ) => Promise<{ id: string; name: string; size: number; format: string }>;
  onDeleteFile: (fileId: string) => Promise<void>;
  initialAttachedFiles: AttachedFile[];
  errorMessage: string;
}

export function useAttachmentManager({
  onUploadFile,
  onDeleteFile,
  initialAttachedFiles,
  errorMessage,
}: UseAttachmentManagerOptions) {
  type State = {
    pendingCount: number;
    locallyAdded: AttachedFile[];
    locallyRemovedIds: Set<string>;
    error: string;
  };
  type Action =
    | { type: "patch"; value: Partial<State> }
    | { type: "start" }
    | { type: "finish" }
    | { type: "add"; file: AttachedFile }
    | { type: "remove"; id: string };
  const [state, update] = useReducer(
    (current: State, action: Action): State =>
      action.type === "start"
        ? {
            ...current,
            pendingCount: current.pendingCount + 1,
            error: current.pendingCount ? current.error : "",
          }
        : action.type === "finish"
          ? { ...current, pendingCount: current.pendingCount - 1 }
          : action.type === "patch"
            ? { ...current, ...action.value }
            : action.type === "add"
              ? {
                  ...current,
                  locallyAdded: [...current.locallyAdded, action.file],
                }
              : {
                  ...current,
                  locallyRemovedIds: new Set(current.locallyRemovedIds).add(
                    action.id,
                  ),
                },
    {
      pendingCount: 0,
      locallyAdded: [],
      locallyRemovedIds: new Set<string>(),
      error: "",
    },
  );

  const attachedFiles: AttachedFile[] = [
    ...initialAttachedFiles.filter((f) => !state.locallyRemovedIds.has(f.id)),
    ...state.locallyAdded.filter(
      (f) =>
        !state.locallyRemovedIds.has(f.id) &&
        !initialAttachedFiles.some((e) => e.id === f.id),
    ),
  ];

  async function handleUpload(file: File) {
    update({ type: "start" });
    try {
      const fileView = await onUploadFile(file);
      update({
        type: "add",
        file: {
          id: fileView.id,
          name: fileView.name,
          size: fileView.size,
          format: fileView.format,
        },
      });
    } catch {
      update({ type: "patch", value: { error: errorMessage } });
      throw new Error(errorMessage);
    } finally {
      update({ type: "finish" });
    }
  }

  async function handleRemove(fileId: string) {
    update({ type: "start" });
    try {
      await onDeleteFile(fileId);
      update({ type: "remove", id: fileId });
    } catch {
      update({ type: "patch", value: { error: errorMessage } });
    } finally {
      update({ type: "finish" });
    }
  }

  return {
    uploading: state.pendingCount > 0,
    attachedFiles,
    handleUpload,
    handleRemove,
    error: state.error,
  };
}
