import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DataTable,
  RowActionsMenu,
  useDataTableState,
  type ColumnDef,
  type DataTableProps,
} from "../index";
import {
  campaigns,
  campaignColumns,
  campaignFilters,
  getCampaignId,
  type Campaign,
} from "./fixtures";
function TableDemo(
  props: Pick<DataTableProps<Campaign>, "loading" | "error"> & {
    withoutToolbar?: boolean;
    empty?: boolean;
    noResults?: boolean;
    server?: boolean;
    filtered?: boolean;
  },
) {
  const state = useDataTableState({
    pagination: { pageIndex: props.server ? 2 : 0, pageSize: 5 },
    search: props.noResults ? "no-match" : "",
    filters: props.filtered ? { status: "Draft" } : {},
  });
  const common = {
    ...state,
    data: props.empty ? [] : campaigns,
    columns: campaignColumns,
    searchable: !props.withoutToolbar,
    filters: props.withoutToolbar ? undefined : campaignFilters,
    getRowId: getCampaignId,
    caption: "Campaigns",
    loading: props.loading,
    error: props.error,
    pageSizeOptions: [5, 10, 25],
  };
  return props.server ? (
    <>
      <DataTable
        {...common}
        mode="server"
        total={120}
        data={campaigns.slice(0, 5)}
      />
      <p className="text-ui-muted mt-4">
        Server contract demo: fixed response rows; connect state to a tRPC query
        in the application adapter.
      </p>
      <pre>{JSON.stringify(state.state, null, 2)}</pre>
    </>
  ) : (
    <DataTable {...common} />
  );
}
const meta = {
  title: "Organisms/DataTable",
  component: TableDemo,
} satisfies Meta<typeof TableDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Empty: Story = { args: { empty: true } };
export const NoResults: Story = { args: { noResults: true } };
export const Loading: Story = { args: { loading: true } };
export const Error: Story = {
  args: { error: "The service is temporarily unavailable." },
};
export const ServerControlled: Story = { args: { server: true } };

export const Filtered: Story = { args: { filtered: true } };

export const WithoutToolbar: Story = { args: { withoutToolbar: true } };

type OverflowRow = { id: string; name: string };
const overflowRows: OverflowRow[] = [
  { id: "row-1", name: "First record" },
  { id: "row-2", name: "Second record" },
];
const overflowColumns: ColumnDef<OverflowRow>[] = [
  { accessorKey: "name", header: "Name" },
  ...["Owner", "Department", "Status", "Created", "Updated", "Region"].map(
    (header): ColumnDef<OverflowRow> => ({
      id: header,
      header,
      cell: () => `${header} value that fills the column`,
    }),
  ),
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <RowActionsMenu
        label="Actions"
        items={[{ label: "Open record", onSelect: () => undefined }]}
      />
    ),
  },
];
function OverflowDemo() {
  const state = useDataTableState();
  return (
    <div style={{ maxWidth: 700 }}>
      <DataTable
        {...state}
        data={overflowRows}
        columns={overflowColumns}
        getRowId={(row) => row.id}
        caption="Wide records"
        searchable={false}
      />
    </div>
  );
}
export const HorizontalOverflow: Story = {
  render: () => <OverflowDemo />,
};
