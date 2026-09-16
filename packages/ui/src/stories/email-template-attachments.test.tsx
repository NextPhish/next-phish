import {
  act,
  renderHook,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileAttachmentPanel } from "../../../../apps/next-app/src/components/organisms/email-templates/file-attachment-panel";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
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

describe("concurrent attachment operations", () => {
  it("stays busy until all uploads settle and preserves a failed upload error", async () => {
    let finishFirst!: (file: {
      id: string;
      name: string;
      size: number;
      format: string;
    }) => void;
    let failSecond!: (reason: Error) => void;
    const upload = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            failSecond = reject;
          }),
      );
    const { result } = renderHook(() =>
      useAttachmentManager({
        onUploadFile: upload,
        onDeleteFile: vi.fn(),
        initialAttachedFiles: [],
        errorMessage: "Attachment failed",
      }),
    );
    let first!: Promise<void>;
    let second!: Promise<unknown>;
    act(() => {
      first = result.current.handleUpload(new File(["a"], "a.pdf"));
      second = result.current
        .handleUpload(new File(["b"], "b.pdf"))
        .catch((error) => error);
    });
    expect(result.current.uploading).toBe(true);
    await act(async () => {
      failSecond(new Error("denied"));
      await second;
    });
    expect(result.current.uploading).toBe(true);
    expect(result.current.error).toBe("Attachment failed");
    await act(async () => {
      finishFirst({
        id: "a",
        name: "a.pdf",
        size: 1,
        format: "application/pdf",
      });
      await first;
    });
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBe("Attachment failed");
    expect(result.current.attachedFiles.map((file) => file.id)).toEqual(["a"]);
  });
});

it("retries only failed attachments after a partially successful batch", async () => {
  const user = userEvent.setup();
  const upload = vi
    .fn()
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("failed"))
    .mockResolvedValueOnce(undefined);
  render(
    <I18nProvider initialLocale="en">
      <FileAttachmentPanel files={[]} onUpload={upload} onRemove={vi.fn()} />
    </I18nProvider>,
  );
  const first = new File(["a"], "a.pdf", { type: "application/pdf" });
  const second = new File(["b"], "b.pdf", { type: "application/pdf" });
  await user.upload(screen.getByLabelText("Upload file"), [first, second]);
  await user.click(screen.getByRole("button", { name: "Upload file" }));
  await screen.findByText("Upload failed.");
  expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  expect(screen.getByText("b.pdf")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Upload file" }));
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(3));
  expect(upload.mock.calls.map(([file]) => file)).toEqual([
    first,
    second,
    second,
  ]);
});
