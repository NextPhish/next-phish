import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignListContainer } from "../../../../apps/next-app/src/components/organisms/campaigns/list-container";
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ campaign: { list: { invalidate: mocks.invalidate } } }),
    campaign: {
      list: { useQuery: mocks.query },
      delete: {
        useMutation: () => ({ mutate: mocks.remove, isPending: false }),
      },
    },
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue({
    data: { rows: [], total: 0 },
    isLoading: false,
    refetch: vi.fn(),
  });
});
it("wires V1 sorting to campaign.list server query", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <CampaignListContainer />
    </I18nProvider>,
  );
  expect(mocks.query).toHaveBeenCalledWith(
    expect.objectContaining({ limit: 10, offset: 0 }),
  );
  await user.click(screen.getByRole("button", { name: /name/i }));
  expect(mocks.query).toHaveBeenLastCalledWith(
    expect.objectContaining({
      sort: [{ field: "name", order: "desc" }],
      limit: 10,
      offset: 0,
    }),
  );
});
