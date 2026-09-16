import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ImportWebsiteDialog } from "../../../../apps/next-app/src/components/organisms/pages/import-website-dialog";
const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  import: vi.fn(),
  hide: vi.fn(),
}));
vi.mock("@/src/hooks/use-import-dialog", () => ({
  useImportDialog: () => ({
    state: {
      url: "",
      includeAssets: true,
      importing: false,
      error: "",
      jobId: null,
      progress: null,
    },
    dispatch: mocks.dispatch,
    previousImports: [],
    handleImport: mocks.import,
    handleSelectPrevious: vi.fn(),
    handleSearch: vi.fn(),
    handleHide: mocks.hide,
  }),
}));
const t = (key: string) =>
  ({
    "common.cancel": "Cancel",
    "pages.importWebsiteTitle": "Import from URL",
    "pages.importWebsiteHint": "Fetch HTML",
    "pages.importWebsiteWarning": "Review imported content",
    "pages.importWebsiteButton": "Import",
    "pages.urlLabel": "URL",
    "pages.urlPlaceholder": "https://example.com",
    "pages.includeAssets": "Include assets",
    "pages.includeAssetsHint": "Download referenced files",
    "pages.previousImports": "Previous imports",
  })[key] ?? key;
it("submits the validated URL with the assets choice and delegates cancellation", async () => {
  const user = userEvent.setup();
  render(
    <ImportWebsiteDialog
      visible
      t={t}
      onImportComplete={vi.fn()}
      onHide={vi.fn()}
    />,
  );
  await user.type(screen.getByLabelText("URL"), "https://example.com/login");
  await user.click(screen.getByRole("button", { name: "Import" }));
  await waitFor(() =>
    expect(mocks.import).toHaveBeenCalledWith(
      "https://example.com/login",
      true,
    ),
  );
  expect(mocks.dispatch).toHaveBeenCalledWith({
    type: "SET_URL",
    url: "https://example.com/login",
  });
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(mocks.hide).toHaveBeenCalled();
});
