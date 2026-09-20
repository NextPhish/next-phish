import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { OrganizationListView } from "../../../../apps/next-app/src/components/organisms/organizations/organization-list/parts/organization-list-view";
import type { OrganizationListModel } from "../../../../apps/next-app/src/components/organisms/organizations/organization-list/types/organization-list.types";
import { AppShell, useDataTableState } from "../index";
type OrganizationView = OrganizationListModel["organizations"][number];

export const demoOrganizations = [
  {
    id: "acme",
    name: "Acme Security",
    slug: "acme-security",
    createdAt: new Date("2026-09-01"),
    $me: { role: "owner" },
  },
  {
    id: "research",
    name: "Research team",
    slug: "research-team",
    createdAt: new Date("2026-09-05"),
    $me: { role: "admin" },
  },
  {
    id: "training",
    name: "Training workspace",
    slug: "training",
    createdAt: new Date("2026-09-08"),
    $me: { role: "member" },
  },
] as OrganizationView[];
function Preview({ loading = false }: { loading?: boolean }) {
  const table = useDataTableState();
  const [deleting, setDeleting] = useState<OrganizationView | null>(null);
  const role = table.state.filters.role;
  const rows = demoOrganizations.filter(
    (org) =>
      (!role || org.$me.role === role) &&
      org.name.toLowerCase().includes(table.state.search.toLowerCase()),
  );
  return (
    <I18nProvider initialLocale="en">
      <AppShell
        navigation={[
          {
            id: "management",
            label: "Management",
            items: [
              {
                id: "organizations",
                label: "Organizations",
                href: "#organizations",
              },
            ],
          },
        ]}
        activeItem="organizations"
        breadcrumb="Organizations"
      >
        <OrganizationListView
          {...table}
          organizations={rows}
          total={rows.length}
          canDeleteOrganization={() => false}
          loading={loading}
          onRetry={() => {}}
          onManage={() => {}}
          onDeleteRequest={setDeleting}
          deleting={deleting}
          deletePending={false}
          onDeleteCancel={() => setDeleting(null)}
          onDeleteConfirm={() => setDeleting(null)}
        />
      </AppShell>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Organizations/List",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
