import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import {
  PagesListView,
  type PagesListViewProps,
} from "../../../../apps/next-app/src/components/organisms/pages/pages-list/parts/pages-list-view";
import { AppShell, useDataTableState } from "../index";
type Page = PagesListViewProps["pages"][number];

export const demoPages = [
  {
    id: "login",
    name: "Microsoft sign in",
    path: "account/verify",
    type: "LANDING",
    status: "ACTIVE",
    createdById: "u1",
    createdBy: { id: "u1", name: "Alex" },
    updatedAt: new Date("2026-09-12"),
    createdAt: new Date("2026-09-01"),
  },
  {
    id: "redirect",
    name: "Security training",
    path: "training",
    type: "REDIRECT",
    status: "DRAFT",
    createdById: "u2",
    createdBy: { id: "u2", name: "Mira" },
    updatedAt: new Date("2026-09-10"),
    createdAt: new Date("2026-09-02"),
  },
] as Page[];
function Preview({ loading = false }: { loading?: boolean }) {
  const table = useDataTableState();
  const [deleting, setDeleting] = useState<Page | null>(null);
  return (
    <I18nProvider initialLocale="en">
      <AppShell navigation={[]} activeItem="pages" breadcrumb="Pages">
        <PagesListView
          {...table}
          pages={demoPages}
          total={demoPages.length}
          loading={loading}
          onRetry={() => {}}
          onCreate={() => {}}
          onEdit={() => {}}
          deleting={deleting}
          deletePending={false}
          onDeleteRequest={setDeleting}
          onDeleteCancel={() => setDeleting(null)}
          onDeleteConfirm={() => setDeleting(null)}
        />
      </AppShell>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Pages/List",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
