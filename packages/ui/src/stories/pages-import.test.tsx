import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ImportWebsite } from "../../../../apps/next-app/src/components/organisms/pages/import-website/import-website";
import { PreviousImportsList } from "../../../../apps/next-app/src/components/organisms/pages/import-website/parts/previous-imports-list";
const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  import: vi.fn(),
  hide: vi.fn(),
}));
vi.mock(
  "@/src/components/organisms/pages/import-website/hooks/use-import-dialog",
  () => ({
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
  }),
);
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
    <ImportWebsite visible t={t} onImportComplete={vi.fn()} onHide={vi.fn()} />,
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

it("keeps previous-import search available when the server returns no matches", async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  const props = {
    t: (key: string) =>
      ({
        "pages.previousImports": "Previous imports",
        "pages.searchImports": "Search imports",
        "pages.noMatchingImports": "No imports match {search}",
        "pages.htmlOnly": "HTML only",
      })[key] ?? key,
    onSelect: vi.fn(),
    onSearch,
  };
  const imports = [
    {
      id: "one",
      url: "https://example.com",
      finalUrl: null,
      status: "COMPLETED",
      includeAssets: false,
      html: "<p>Page</p>",
      assetDownloaded: 0,
      fileCount: 0,
      createdAt: new Date("2026-09-01"),
    },
  ];
  const view = render(<PreviousImportsList {...props} imports={imports} />);
  await user.click(screen.getByRole("button", { name: /Previous imports/ }));
  await user.type(screen.getByPlaceholderText("Search imports"), "missing");
  expect(onSearch).toHaveBeenLastCalledWith("missing");
  view.rerender(<PreviousImportsList {...props} imports={[]} />);
  expect(screen.getByText("No imports match missing")).toBeInTheDocument();
  await user.clear(screen.getByPlaceholderText("Search imports"));
  expect(onSearch).toHaveBeenLastCalledWith("");
});
