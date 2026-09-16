import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { TargetGroupDetailPresentation } from "../../../../apps/next-app/src/components/organisms/target-groups/detail-presentation";
import { AppShell, useDataTableState } from "../index";
function Preview({ loading = false }: { loading?: boolean }) {
  const table = useDataTableState();
  return (
    <I18nProvider initialLocale="en">
      <AppShell
        activeItem="target-groups"
        navigation={[]}
        breadcrumb="Engineering"
      >
        <TargetGroupDetailPresentation
          {...table}
          group={
            {
              id: "engineering",
              name: "Engineering",
              status: "ACTIVE",
            } as Parameters<typeof TargetGroupDetailPresentation>[0]["group"]
          }
          groupId="engineering"
          groupLoading={false}
          users={
            [
              {
                id: "alex",
                email: "alex@example.com",
                firstName: "Alex",
                lastName: "Morgan",
                position: "Engineer",
              },
              {
                id: "mira",
                email: "mira@example.com",
                firstName: "Mira",
                lastName: "Ivanova",
                position: "Manager",
              },
            ] as Parameters<typeof TargetGroupDetailPresentation>[0]["users"]
          }
          total={2}
          usersLoading={loading}
          onRetryUsers={() => {}}
          onAdd={() => {}}
          onImport={() => {}}
          removing={null}
          removePending={false}
          onRemoveRequest={() => {}}
          onRemoveCancel={() => {}}
          onRemoveConfirm={() => {}}
          form={
            <div className="grid gap-3">
              <strong>Engineering</strong>
              <span>Active</span>
            </div>
          }
        />
      </AppShell>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Target Groups/Detail",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const UsersLoading: Story = { args: { loading: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
