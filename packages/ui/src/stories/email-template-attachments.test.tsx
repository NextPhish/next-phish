import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAttachmentManager } from "../../../../apps/next-app/src/hooks/use-attachment-manager";

describe("email template attachments", () => {
  it("keeps the uploaded file id for the template payload and only removes after deletion succeeds", async () => {
    const upload = vi.fn().mockResolvedValue({
      id: "file-new",
      name: "guide.pdf",
      size: 42,
      format: "application/pdf",
    });
    const remove = vi.fn().mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() =>
      useAttachmentManager({
        onUploadFile: upload,
        onDeleteFile: remove,
        initialAttachedFiles: [
          {
            id: "file-old",
            name: "old.pdf",
            size: 10,
            format: "application/pdf",
          },
        ],
        errorMessage: "Attachment failed",
      }),
    );
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });
    await act(async () => result.current.handleUpload(file));
    expect(upload).toHaveBeenCalledWith(file);
    expect(result.current.attachedFiles.map(({ id }) => id)).toEqual([
      "file-old",
      "file-new",
    ]);
    await act(async () => result.current.handleRemove("file-old"));
    expect(remove).toHaveBeenCalledWith("file-old");
    expect(result.current.attachedFiles.map(({ id }) => id)).toContain(
      "file-old",
    );
    expect(result.current.error).toBe("Attachment failed");
    remove.mockResolvedValue(undefined);
    await act(async () => result.current.handleRemove("file-new"));
    expect(result.current.attachedFiles.map(({ id }) => id)).toEqual([
      "file-old",
    ]);
    expect(result.current.error).toBe("");
  });
});
