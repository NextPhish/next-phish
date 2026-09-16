import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./data-table";
import { useDataTableState } from "../hooks/use-data-table-state";

function Table({ searchable }: { searchable?: boolean }) {
  const { state, onStateChange } = useDataTableState();
  return (
    <DataTable<{ name: string }>
      mode="server"
      data={[]}
      total={0}
      columns={[{ accessorKey: "name", header: "Name" }]}
      getRowId={(row) => row.name}
      caption="Recipients"
      state={state}
      onStateChange={onStateChange}
      searchable={searchable}
    />
  );
}

describe("DataTable searchable option", () => {
  it("shows search by default and hides it when server search is unavailable", () => {
    const view = render(<Table />);
    expect(
      screen.getByRole("searchbox", { name: "Search records" }),
    ).toBeInTheDocument();
    view.rerender(<Table searchable={false} />);
    expect(
      screen.queryByRole("searchbox", { name: "Search records" }),
    ).not.toBeInTheDocument();
  });
});
