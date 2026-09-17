import { useState } from "react";
import { expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Autocomplete,
  Select,
  MultiSelect,
  FileUploader,
  DataTable,
  useDataTableState,
  type ColumnDef,
  type TableFilter,
} from "../index";
const options = [
  { value: "a", label: "Engineering" },
  { value: "b", label: "Finance" },
  { value: "c", label: "Archived", disabled: true },
];
function Single({ autocomplete = false }: { autocomplete?: boolean }) {
  const [value, setValue] = useState("");
  const Control = autocomplete ? Autocomplete : Select;
  return (
    <Control
      aria-label="Team"
      value={value}
      onValueChange={setValue}
      options={options}
    />
  );
}
it("selects a Radix option with the keyboard and restores focus", async () => {
  const user = userEvent.setup();
  render(<Single />);
  const trigger = screen.getByRole("combobox", { name: "Team" });
  trigger.focus();
  await user.keyboard("{ArrowDown}");
  await user.keyboard("{Home}{Enter}");
  expect(trigger).toHaveTextContent("Engineering");
  expect(trigger).toHaveFocus();
});
it("filters autocomplete suggestions and commits an option", async () => {
  const user = userEvent.setup();
  render(<Single autocomplete />);
  const input = screen.getByRole("combobox", { name: "Team" });
  await user.click(input);
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("listbox", { name: "Suggestions" })).toBeVisible();
  await user.click(input);
  expect(input).toHaveAttribute("aria-expanded", "true");
  await user.type(input, "Fin");
  expect(
    screen.queryByRole("option", { name: "Engineering" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("option", { name: "Finance" }));
  expect(input).toHaveValue("Finance");
  expect(input).toHaveAttribute("aria-expanded", "false");
});
it("retains multiselect values while searching and removes individual tags", async () => {
  function Multi() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <MultiSelect
        aria-label="Teams"
        options={options}
        value={value}
        onValueChange={setValue}
      />
    );
  }
  const user = userEvent.setup();
  render(<Multi />);
  await user.click(screen.getByRole("button", { name: "Teams" }));
  await user.click(screen.getByRole("checkbox", { name: "Engineering" }));
  await user.type(
    screen.getByRole("textbox", { name: "Search options" }),
    "Fin",
  );
  await user.click(screen.getByRole("checkbox", { name: "Finance" }));
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.getByRole("button", { name: "Teams" })).toHaveTextContent(
    "2 selected",
  );
  await user.click(screen.getByRole("button", { name: "Remove Engineering" }));
  expect(screen.getByRole("button", { name: "Teams" })).toHaveTextContent(
    "1 selected",
  );
});
it("rejects invalid files, preserves accepted files on failure and supports retry", async () => {
  const upload = vi
    .fn()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(undefined);
  function Files() {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <FileUploader
        files={files}
        onFilesChange={setFiles}
        accept=".csv"
        maxFiles={1}
        maxFileSize={20}
        onUpload={upload}
      />
    );
  }
  const user = userEvent.setup({ applyAccept: false });
  render(<Files />);
  const input = screen.getByLabelText("Attachments");
  await user.upload(
    input,
    new File(["pdf"], "bad.pdf", { type: "application/pdf" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("unsupported file type");
  await user.upload(
    input,
    new File(["x".repeat(21)], "large.csv", { type: "text/csv" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("too large");
  await user.upload(
    input,
    new File(["name\nA"], "good.csv", { type: "text/csv" }),
  );
  await user.click(screen.getByRole("button", { name: "Upload files" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Upload failed");
  expect(screen.getByText("good.csv")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Upload files" }));
  expect(await screen.findByRole("status")).toHaveTextContent("successfully");
  expect(upload).toHaveBeenCalledTimes(2);
});
const rows = [
  { id: "1", name: "Alpha", status: "Draft", count: 0, date: "2026-09-01" },
  { id: "2", name: "Beta", status: "Running", count: 5, date: "2026-09-02" },
  { id: "3", name: "Gamma", status: "Draft", count: 5, date: "2026-09-02" },
];
const columns: ColumnDef<(typeof rows)[number]>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "count", header: "Count" },
  { accessorKey: "date", header: "Date" },
];
const filters: TableFilter[] = [
  {
    field: "status",
    label: "Status filter",
    type: "select",
    options: [
      { value: "Draft", label: "Draft" },
      { value: "Running", label: "Running" },
    ],
  },
  { field: "name", label: "Name filter", type: "text" },
  { field: "count", label: "Count filter", type: "numeric" },
  { field: "date", label: "Date filter", type: "date" },
];
function FilteredTable({ server = false }: { server?: boolean }) {
  const state = useDataTableState({
    pagination: { pageIndex: 1, pageSize: 2 },
  });
  const props = {
    ...state,
    data: rows,
    columns,
    filters,
    caption: "Filtered records",
    getRowId: (row: (typeof rows)[number]) => row.id,
  };
  return server ? (
    <DataTable {...props} mode="server" total={10} />
  ) : (
    <DataTable {...props} />
  );
}
it("combines select, numeric, date and text filters and resets pagination", async () => {
  const user = userEvent.setup();
  render(<FilteredTable />);
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Status filter" }));
  await user.click(screen.getByRole("combobox", { name: "Status filter" }));
  await user.click(screen.getByRole("option", { name: "Draft" }));
  expect(screen.getByText("Page 1 of 1 · 2 records")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Count filter" }));
  await user.type(screen.getByLabelText("Count filter"), "0");
  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Name filter" }));
  await user.type(screen.getByLabelText("Name filter"), "Gam");
  expect(screen.getByText("Gamma")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Date filter" }));
  await user.type(screen.getByLabelText("Date filter"), "2026-09-02");
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3);
});
it("passes server filter state through without filtering response rows", async () => {
  const user = userEvent.setup();
  render(<FilteredTable server />);
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Status filter" }));
  await user.click(screen.getByRole("combobox", { name: "Status filter" }));
  await user.click(screen.getByRole("option", { name: "Running" }));
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(4);
  expect(screen.getByText("Page 1 of 5 · 10 records")).toBeInTheDocument();
});
