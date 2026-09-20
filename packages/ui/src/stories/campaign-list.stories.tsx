import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignListView } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-list/parts/campaign-list-view";

const rows = [
  {
    id: "campaign-1",
    name: "Quarterly password reset",
    tags: ["quarterly", "passwords"],
    type: "CONCRETE" as const,
    status: "ACTIVE",
    targetTimezone: "Europe/Sofia",
    updatedAt: new Date("2026-09-14"),
    emailTemplate: { name: "Password expiry" },
    page: { name: "Microsoft sign-in" },
    targetGroup: { name: "All employees", _count: { users: 248 } },
  },
  {
    id: "campaign-2",
    name: "Invoice awareness template",
    tags: ["finance"],
    type: "TEMPLATE" as const,
    status: "DRAFT",
    targetTimezone: "UTC",
    updatedAt: new Date("2026-09-10"),
    emailTemplate: { name: "Invoice shared" },
    page: { name: "Document viewer" },
    targetGroup: null,
  },
];
function Preview() {
  return (
    <CampaignListView
      rows={rows}
      total={2}
      loading={false}
      state={{
        search: "",
        sorting: [],
        filters: {},
        pagination: { pageIndex: 0, pageSize: 10 },
      }}
      onStateChange={() => undefined}
      onRetry={() => undefined}
      onOpen={() => undefined}
      onEdit={() => undefined}
      onCreate={() => undefined}
      deleting={null}
      deletePending={false}
      deleteError=""
      onDeleteRequest={() => undefined}
      onDeleteCancel={() => undefined}
      onDeleteConfirm={() => undefined}
    />
  );
}
const meta = {
  title: "Screens/Campaigns/List",
  component: Preview,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <I18nProvider initialLocale="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof Preview>;
export default meta;
export const Populated: StoryObj<typeof meta> = {};
