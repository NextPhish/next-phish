import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, useDataTableState, type DataTableProps } from "../index";
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
