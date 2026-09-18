import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, useDataTableState, type ColumnDef } from "../index";
const rows = [
  { id: "a", name: "Zulu" },
  { id: "b", name: "Alpha" },
  { id: "c", name: "Bravo" },
];
const columns: ColumnDef<(typeof rows)[number]>[] = [
  { accessorKey: "name", header: "Name" },
];
function Demo({ server = false }: { server?: boolean }) {
  const model = useDataTableState({
    pagination: { pageIndex: server ? 2 : 0, pageSize: 2 },
  });
  const common = {
    ...model,
    data: rows,
    columns,
    getRowId: (row: (typeof rows)[number]) => row.id,
    caption: "Records",
  };
  return server ? (
    <DataTable {...common} mode="server" total={20} />
  ) : (
    <DataTable {...common} />
  );
}
describe("DataTable", () => {
  it("marks the actions header and cells as the sticky column", () => {
    function ActionsDemo() {
      const model = useDataTableState();
      return (
        <DataTable
          {...model}
          data={rows}
          columns={[
            ...columns,
            { id: "actions", header: "Actions", cell: () => "More" },
          ]}
          getRowId={(row) => row.id}
          caption="Records"
        />
      );
    }
    render(<ActionsDemo />);
    expect(screen.getByRole("columnheader", { name: "Actions" })).toHaveClass(
      "np-table-actions",
    );
    expect(screen.getAllByRole("cell", { name: "More" })).toHaveLength(3);
    screen
      .getAllByRole("cell", { name: "More" })
      .forEach((cell) => expect(cell).toHaveClass("np-table-actions"));
  });
  it("sorts and paginates locally, resetting to page one when searching", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    const bodyRows = within(screen.getByRole("table")).getAllByRole("row");
    expect(bodyRows[1]).toHaveTextContent("Alpha");
    expect(bodyRows[2]).toHaveTextContent("Bravo");
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 2 of 2 · 3 records")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "Alpha");
    expect(screen.getByText("Page 1 of 1 · 1 records")).toBeInTheDocument();
    expect(screen.queryByText("Zulu")).not.toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "missing");
    await user.click(
      screen.getByRole("button", { name: "Clear search and filters" }),
    );
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
  it("does not re-sort, filter or slice a server response", async () => {
    const user = userEvent.setup();
    render(<Demo server />);
    expect(screen.getByText("Page 3 of 10 · 20 records")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(
      4,
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(
      within(screen.getByRole("table")).getAllByRole("row")[1],
    ).toHaveTextContent("Zulu");
    await user.type(screen.getByRole("searchbox"), "no-match");
    expect(screen.getByText("Zulu")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 10 · 20 records")).toBeInTheDocument();
  });
});
