import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2 } from "lucide-react";
import { AppShell, Card, CardBody, useDataTableState } from "../index";
import { OrganizationDetailView } from "../../../../apps/next-app/src/components/organisms/organizations/organization-detail/parts/organization-detail-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

const months = [
  {
    month: "2026-04",
    campaigns: 2,
    sent: 350,
    opened: 201,
    clicked: 41,
    submitted: 8,
    reported: 19,
    failed: 3,
  },
  {
    month: "2026-05",
    campaigns: 4,
    sent: 690,
    opened: 420,
    clicked: 72,
    submitted: 14,
    reported: 38,
    failed: 5,
  },
  {
    month: "2026-06",
    campaigns: 3,
    sent: 520,
    opened: 337,
    clicked: 64,
    submitted: 11,
    reported: 33,
    failed: 2,
  },
  {
    month: "2026-07",
    campaigns: 5,
    sent: 840,
    opened: 501,
    clicked: 97,
    submitted: 20,
    reported: 51,
    failed: 8,
  },
  {
    month: "2026-08",
    campaigns: 4,
    sent: 720,
    opened: 466,
    clicked: 86,
    submitted: 16,
    reported: 47,
    failed: 4,
  },
  {
    month: "2026-09",
    campaigns: 6,
    sent: 940,
    opened: 622,
    clicked: 114,
    submitted: 23,
    reported: 62,
    failed: 6,
  },
];

function OrganizationDetailPreview() {
  const { state, onStateChange } = useDataTableState();
  const organization = {
    id: "org-acme",
    name: "Acme Security",
    slug: "acme-security",
    logo: null,
    createdAt: new Date("2025-02-10"),
    $me: {
      id: "membership-alex",
      userId: "alex",
      role: "owner",
      createdAt: new Date("2025-02-10"),
    },
  };
  const rows = [
    {
      id: "member-1",
      userId: "alex",
      role: "owner",
      createdAt: new Date("2025-02-10"),
      user: { name: "Alex Morgan", email: "alex@acme.example", image: null },
    },
    {
      id: "member-2",
      userId: "mira",
      role: "admin",
      createdAt: new Date("2025-05-18"),
      user: { name: "Mira Patel", email: "mira@acme.example", image: null },
    },
    {
      id: "member-3",
      userId: "sam",
      role: "member",
      createdAt: new Date("2026-01-07"),
      user: { name: "Sam Lee", email: "sam@acme.example", image: null },
    },
  ];
  return (
    <AppShell
      navigation={[
        {
          id: "manage",
          label: "Manage",
          items: [
            {
              id: "organizations",
              label: "Organizations",
              href: "#",
              icon: <Building2 size={18} />,
            },
          ],
        },
      ]}
      activeItem="organizations"
      breadcrumb="Organizations"
      profile={<span>Alex Morgan</span>}
    >
      <OrganizationDetailView
        model={{
          organization,
          canManage: true,
          analytics: months,
          analyticsLoading: false,
          analyticsError: null,
          onRetryAnalytics: () => {},
          members: {
            rows,
            total: rows.length,
            state,
            onStateChange,
            loading: false,
            error: null,
            onRetry: () => {},
          },
        }}
        settings={
          <Card>
            <CardBody>Organization settings form preview</CardBody>
          </Card>
        }
      />
    </AppShell>
  );
}

const meta = {
  title: "Screens/Organizations/Detail",
  component: OrganizationDetailPreview,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <I18nProvider initialLocale="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof OrganizationDetailPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
