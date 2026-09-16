"use client";

import { useReducer } from "react";
import type { AttachedFile } from "@/src/components/organisms/email-templates/file-attachment-panel";

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
    uploading: boolean;
    locallyAdded: AttachedFile[];
    locallyRemovedIds: Set<string>;
    error: string;
  };
  type Action =
    | { type: "patch"; value: Partial<State> }
    | { type: "add"; file: AttachedFile }
    | { type: "remove"; id: string };
  const [state, update] = useReducer(
    (current: State, action: Action): State =>
      action.type === "patch"
        ? { ...current, ...action.value }
        : action.type === "add"
          ? { ...current, locallyAdded: [...current.locallyAdded, action.file] }
          : {
              ...current,
              locallyRemovedIds: new Set(current.locallyRemovedIds).add(
                action.id,
              ),
            },
    {
      uploading: false,
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
    update({ type: "patch", value: { uploading: true, error: "" } });
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
      update({ type: "patch", value: { uploading: false } });
    }
  }

  async function handleRemove(fileId: string) {
    update({ type: "patch", value: { uploading: true, error: "" } });
    try {
      await onDeleteFile(fileId);
      update({ type: "remove", id: fileId });
    } catch {
      update({ type: "patch", value: { error: errorMessage } });
    } finally {
      update({ type: "patch", value: { uploading: false } });
    }
  }

  return {
    uploading: state.uploading,
    attachedFiles,
    handleUpload,
    handleRemove,
    error: state.error,
  };
}
