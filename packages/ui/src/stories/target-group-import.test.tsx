import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupImport } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-import";
const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  start: vi.fn(),
  invalidate: vi.fn(),
  close: vi.fn(),
  refetchJob: vi.fn(),
  jobError: false,
}));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ targetGroup: { invalidate: mocks.invalidate } }),
    file: {
      uploadFile: {
        useMutation: () => ({ mutateAsync: mocks.upload, isPending: false }),
      },
    },
    targetGroup: {
      importUsers: {
        useMutation: () => ({ mutateAsync: mocks.start, isPending: false }),
      },
    },
    job: {
      getById: {
        useQuery: () => ({
          data: undefined,
          error: mocks.jobError ? new Error("internal job failure") : null,
          refetch: mocks.refetchJob,
        }),
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.jobError = false;
  mocks.upload.mockResolvedValue({ id: "file-1" });
  mocks.start.mockResolvedValue({ jobId: "job-1" });
});
it("validates the file before uploading", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupImport visible targetGroupId="group-1" onHide={mocks.close} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Start import" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Select a CSV or Excel file",
  );
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("uploads the selected CSV and starts upsert with the returned file id", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupImport visible targetGroupId="group-1" onHide={mocks.close} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("radio", { name: /Insert \+ Update/ }));
  const file = new File(
    ["email,firstName,lastName\nalex@example.com,Alex,Morgan"],
    "users.csv",
    { type: "text/csv" },
  );
  Object.defineProperty(file, "arrayBuffer", {
    value: async () =>
      new TextEncoder().encode("email,firstName,lastName").buffer,
  });
  await user.upload(screen.getByLabelText("Upload file"), file);
  await user.click(screen.getByRole("button", { name: "Start import" }));
  await waitFor(() =>
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "users.csv",
        purpose: "IMPORT",
        format: "text/csv",
        data: expect.any(String),
      }),
    ),
  );
  expect(mocks.start).toHaveBeenCalledWith({
    targetGroupId: "group-1",
    mode: "upsert",
    fileId: "file-1",
    fileName: "users.csv",
  });
});
it("keeps a failed upload in configure mode and shows a localized error", async () => {
  mocks.upload.mockRejectedValue(new Error("internal storage message"));
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <TargetGroupImport visible targetGroupId="group-1" onHide={mocks.close} />
    </I18nProvider>,
  );
  const file = new File(["email"], "users.csv", { type: "text/csv" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("email").buffer,
  });
  await user.upload(screen.getByLabelText("Upload file"), file);
  await user.click(screen.getByRole("button", { name: "Start import" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not start the import",
  );
  expect(mocks.start).not.toHaveBeenCalled();
  expect(mocks.close).not.toHaveBeenCalled();
});
it("shows a retry when import progress cannot be loaded", async () => {
  const user = userEvent.setup();
  const dialog = (
    <I18nProvider initialLocale="en">
      <TargetGroupImport visible targetGroupId="group-1" onHide={mocks.close} />
    </I18nProvider>
  );
  const { rerender } = render(dialog);
  const file = new File(["email"], "users.csv", { type: "text/csv" });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => new TextEncoder().encode("email").buffer,
  });
  await user.upload(screen.getByLabelText("Upload file"), file);
  await user.click(screen.getByRole("button", { name: "Start import" }));
  await waitFor(() => expect(mocks.start).toHaveBeenCalled());
  mocks.jobError = true;
  rerender(
    <I18nProvider initialLocale="en">
      <TargetGroupImport visible targetGroupId="group-1" onHide={mocks.close} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(mocks.refetchJob).toHaveBeenCalledOnce();
});
