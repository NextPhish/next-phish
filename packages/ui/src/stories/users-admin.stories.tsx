import { useState } from "react";
import { Formik } from "formik";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  UserDeletionPreview,
  UserView,
} from "../../../backend/src/user/types";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { UsersPresentation } from "../../../../apps/next-app/src/components/organisms/users/users-presentation";
import { CreateUserPresentation } from "../../../../apps/next-app/src/components/organisms/users/create-user-presentation";
import { DeleteUserPresentation } from "../../../../apps/next-app/src/components/organisms/users/delete-user-presentation";
import { AppShell, useDataTableState } from "../index";
export const demoUsers = [
  {
    id: "admin",
    name: "Alex Morgan",
    email: "alex@example.com",
    emailVerified: true,
    role: "admin",
    passwordSetupRequired: false,
    disabledAt: null,
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-01"),
    organizations: [{ id: "acme", name: "Acme", role: "owner" }],
    ownedOrganizationCount: 1,
  },
  {
    id: "new",
    name: "Mira Ivanova",
    email: "mira@example.com",
    emailVerified: false,
    role: "user",
    passwordSetupRequired: true,
    disabledAt: null,
    createdAt: new Date("2026-09-10"),
    updatedAt: new Date("2026-09-10"),
    organizations: [],
    ownedOrganizationCount: 0,
  },
  {
    id: "inactive",
    name: "Sam Lee",
    email: "sam@example.com",
    emailVerified: true,
    role: "user",
    passwordSetupRequired: false,
    disabledAt: new Date("2026-09-12"),
    createdAt: new Date("2026-08-01"),
    updatedAt: new Date("2026-09-12"),
    organizations: [],
    ownedOrganizationCount: 0,
  },
] as UserView[];
function List({ loading = false }: { loading?: boolean }) {
  const table = useDataTableState();
  const [toggling, setToggling] = useState<UserView | null>(null);
  return (
    <I18nProvider initialLocale="en">
      <AppShell activeItem="users" navigation={[]} breadcrumb="Users">
        <UsersPresentation
          {...table}
          users={demoUsers}
          total={demoUsers.length}
          loading={loading}
          onRetry={() => {}}
          onCreate={() => {}}
          onDeleteRequest={() => {}}
          toggling={toggling}
          onToggleRequest={setToggling}
          onToggleCancel={() => setToggling(null)}
          onToggleConfirm={() => setToggling(null)}
          togglePending={false}
        />
      </AppShell>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Admin Users/List",
  component: List,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export function UserCreateFixture() {
  return (
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={{
          name: "",
          email: "",
          role: "user" as const,
          organizationMode: "existing" as const,
          organizationId: "",
        }}
        onSubmit={() => {}}
      >
        <CreateUserPresentation
          visible
          organizations={[
            { id: "acme", name: "Acme" },
            { id: "research", name: "Research" },
          ]}
          organizationsLoading={false}
          error=""
          onCancel={() => {}}
        />
      </Formik>
    </I18nProvider>
  );
}
export const demoPreview: UserDeletionPreview = {
  userId: "admin",
  ownedOrganizations: [{ id: "acme", name: "Acme" }],
  orphanedUsers: [{ id: "mira", name: "Mira", email: "mira@example.com" }],
  hasActiveData: true,
};
export function UserDeletionFixture({
  state = "ready",
}: {
  state?: "ready" | "loading" | "error";
}) {
  const [action, setAction] = useState<"keep" | "delete">("keep");
  return (
    <I18nProvider initialLocale="en">
      <DeleteUserPresentation
        user={demoUsers[0]!}
        preview={state === "ready" ? demoPreview : undefined}
        previewLoading={state === "loading"}
        previewError={state === "error"}
        onRetry={() => {}}
        orphanAction={action}
        onOrphanActionChange={setAction}
        canDelete={state === "ready"}
        pending={false}
        error=""
        onConfirm={() => {}}
        onClose={() => {}}
      />
    </I18nProvider>
  );
}
