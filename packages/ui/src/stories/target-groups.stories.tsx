import { useState } from "react";
import { Formik } from "formik";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import {
  TargetGroupListView,
  type TargetGroupListViewProps,
} from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-list/parts/target-group-list-view";
import { TargetGroupFormFields } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-form/parts/target-group-form-fields";
import { TargetGroupImportView } from "../../../../apps/next-app/src/components/organisms/target-groups/target-group-import/parts/target-group-import-view";
import { AppShell, useDataTableState } from "../index";
type Group = TargetGroupListViewProps["groups"][number];
export const demoGroups = [
  {
    id: "engineering",
    name: "Engineering",
    status: "ACTIVE",
    userCount: 26,
    createdById: "alex",
    createdBy: { id: "alex", name: "Alex" },
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-12"),
  },
  {
    id: "finance",
    name: "Finance",
    status: "DRAFT",
    userCount: 18,
    createdById: "mira",
    createdBy: { id: "mira", name: "Mira" },
    createdAt: new Date("2026-09-02"),
    updatedAt: new Date("2026-09-10"),
  },
] as Group[];
function List({ loading = false }: { loading?: boolean }) {
  const table = useDataTableState();
  const [deleting, setDeleting] = useState<Group | null>(null);
  return (
    <I18nProvider initialLocale="en">
      <AppShell
        activeItem="target-groups"
        navigation={[]}
        breadcrumb="Target Groups"
      >
        <TargetGroupListView
          {...table}
          groups={demoGroups}
          total={demoGroups.length}
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
  title: "Screens/Target Groups/List",
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

export function TargetGroupFormFixture() {
  return (
    <I18nProvider initialLocale="en">
      <div className="np-theme" style={{ padding: 24, maxWidth: 900 }}>
        <Formik
          initialValues={{
            name: "Engineering",
            status: "ACTIVE" as const,
            users: [
              {
                _key: "one",
                email: "alex@example.com",
                firstName: "Alex",
                lastName: "Morgan",
                position: "Engineer",
              },
            ],
          }}
          onSubmit={() => {}}
        >
          <TargetGroupFormFields
            error=""
            success=""
            isEdit={false}
            onCancel={() => {}}
          />
        </Formik>
      </div>
    </I18nProvider>
  );
}
export function TargetGroupImportFixture({
  status = "configure",
}: {
  status?: "configure" | "importing" | "done";
}) {
  return (
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={{ mode: "insert" as const, file: null as File | null }}
        onSubmit={() => {}}
      >
        <TargetGroupImportView
          visible
          onHide={() => {}}
          step={status}
          busy={false}
          error=""
          jobError={false}
          onRetryJob={() => {}}
          resultStatus={status === "done" ? "completed" : "importing"}
          progress={
            status === "configure"
              ? null
              : {
                  total: 100,
                  processed: status === "done" ? 100 : 58,
                  inserted: 40,
                  updated: 12,
                  skipped: 5,
                  errors: 1,
                  currentBatch: 2,
                  totalBatches: 4,
                  validationErrors: [
                    { row: 12, field: "email", message: "Invalid email" },
                  ],
                }
          }
        />
      </Formik>
    </I18nProvider>
  );
}
