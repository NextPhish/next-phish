import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignListView } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-list/parts/campaign-list-view";

const base = {
  total: 1,
  loading: false,
  error: undefined,
  state: {
    search: "",
    sorting: [],
    filters: {},
    pagination: { pageIndex: 0, pageSize: 10 },
  },
  onStateChange: vi.fn(),
  onRetry: vi.fn(),
  onOpen: vi.fn(),
  onEdit: vi.fn(),
  onCreate: vi.fn(),
  deleting: null,
  deletePending: false,
  deleteError: "",
  onDeleteRequest: vi.fn(),
  onDeleteCancel: vi.fn(),
  onDeleteConfirm: vi.fn(),
};
function row(status: string) {
  return {
    id: status,
    name: status,
    tags: [],
    type: "CONCRETE" as const,
    status,
    targetTimezone: "UTC",
    updatedAt: new Date(),
    emailTemplate: null,
    page: null,
    targetGroup: null,
  };
}
describe("campaign list permissions", () => {
  it("hides editing for active campaigns", async () => {
    render(
      <I18nProvider initialLocale="en">
        <CampaignListView {...base} rows={[row("ACTIVE")]} />
      </I18nProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /actions/i }));
    expect(screen.queryByText("Edit campaign")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete campaign")).not.toBeInTheDocument();
  });
});
