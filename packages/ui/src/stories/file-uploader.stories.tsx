import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileUploader } from "../index";
function FileDemo({
  mode = "ready",
}: {
  mode?: "ready" | "error" | "disabled" | "uploading";
}) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div style={{ maxWidth: 560 }}>
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept=".csv,.pdf"
        maxFiles={3}
        maxFileSize={2 * 1024 * 1024}
        disabled={mode === "disabled"}
        onUpload={async () => {
          if (mode === "error") throw new Error("Simulated failure");
          if (mode === "uploading") await new Promise<void>(() => {});
        }}
      />
      <p className="text-ui-muted text-xs mt-4">
        Local demonstration. Files are not transmitted. Choose a CSV/PDF and
        press Upload to exercise the state.
      </p>
    </div>
  );
}
const meta = {
  title: "Molecules/FileUploader",
  component: FileDemo,
} satisfies Meta<typeof FileDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const UploadFailure: Story = { args: { mode: "error" } };
export const UploadInProgress: Story = { args: { mode: "uploading" } };
export const Disabled: Story = { args: { mode: "disabled" } };
