import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  ListTodo,
  Mail,
  Plus,
  Radio,
  Settings,
  Users,
  Building2,
  Send,
  Activity,
} from "lucide-react";
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Dialog,
  DialogClose,
  MetricCard,
  PageHeader,
  useDataTableState,
  type NavigationGroup,
} from "../index";
import {
  campaigns,
  campaignColumns,
  campaignFilters,
  getCampaignId,
} from "./fixtures";
const groups: NavigationGroup[] = [
  {
    id: "home",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "#overview",
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "tasks",
        label: "Tasks",
        href: "#tasks",
        icon: <ListTodo size={18} />,
        badge: "4",
      },
      {
        id: "schedule",
        label: "Schedule",
        href: "#schedule",
        icon: <CalendarDays size={18} />,
      },
    ],
  },
  {
    id: "simulations",
    label: "Simulations",
    items: [
      {
        id: "campaigns",
        label: "Campaigns",
        href: "#campaigns",
        icon: <Radio size={18} />,
      },
      {
        id: "pages",
        label: "Landing pages",
        href: "#pages",
        icon: <FileText size={18} />,
      },
      {
        id: "templates",
        label: "Email templates",
        href: "#templates",
        icon: <Mail size={18} />,
      },
      {
        id: "profiles",
        label: "Sending profiles",
        href: "#profiles",
        icon: <Send size={18} />,
      },
      {
        id: "groups",
        label: "Target groups",
        href: "#groups",
        icon: <Users size={18} />,
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        id: "organizations",
        label: "Organizations",
        href: "#organizations",
        icon: <Building2 size={18} />,
      },
      {
        id: "users",
        label: "Users",
        href: "#users",
        icon: <Users size={18} />,
      },
      {
        id: "settings",
        label: "Settings",
        href: "#settings",
        icon: <Settings size={18} />,
      },
    ],
  },
];
function Workspace() {
  const table = useDataTableState();
  const [notice, setNotice] = useState(false);
  return (
    <AppShell
      navigation={groups}
      activeItem="overview"
      breadcrumb={
        <>
          Workspace{" "}
          <span className="mx-2" aria-hidden="true">
            /
          </span>{" "}
          Overview
        </>
      }
      organization={
        <div className="flex items-center gap-2">
          <span className="bg-ui-primary rounded px-2 py-1 text-xs">NP</span>
          Next Phish
          <ChevronDown size={14} className="ml-auto" />
        </div>
      }
      profile={
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-ui-tint text-ui-primary p-2 text-xs font-semibold">
            MA
          </span>
          <div>
            Martin Andreev
            <div className="text-xs text-slate-400">
              Workspace administrator
            </div>
          </div>
        </div>
      }
      headerActions={
        <>
          <Badge tone="info">V1 / React</Badge>
          <Button
            variant="ghost"
            aria-label="Notifications"
            onClick={() => setNotice(true)}
          >
            <Bell size={18} />
          </Button>
        </>
      }
    >
      <PageHeader
        title="Workspace overview"
        description="A clear picture of your security awareness program."
        actions={
          <Dialog
            title="Create a campaign"
            description="The component library is ready for the application form adapter."
            trigger={
              <Button>
                <Plus size={16} aria-hidden="true" />
                New campaign
              </Button>
            }
            footer={
              <DialogClose asChild>
                <Button variant="secondary">Back to overview</Button>
              </DialogClose>
            }
          >
            <p>
              This isolated Storybook example uses sample data. Campaign
              creation will retain the existing Formik, Zod and tRPC flow.
            </p>
          </Dialog>
        }
      />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active campaigns"
          value="12"
          detail="3 scheduled for this week"
          icon={<Radio size={18} />}
        />
        <MetricCard
          label="Emails delivered"
          value="4,218"
          detail="96.4% delivery rate"
          icon={<Mail size={18} />}
        />
        <MetricCard
          label="Link click rate"
          value="8.2%"
          detail="Across active simulations"
          icon={<Activity size={18} />}
        />
        <MetricCard
          label="Target groups"
          value="8"
          detail="1,284 people in your workspace"
          icon={<Users size={18} />}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6 mb-6">
        <Card>
          <CardHeader
            title="Engagement over time"
            description="Delivery and clicks over the last 7 days"
            action={<Badge>Last 7 days</Badge>}
          />
          <CardBody>
            <div className="flex gap-5 text-xs text-ui-muted mb-4">
              <span>● Delivered</span>
              <span>○ Clicked</span>
            </div>
            <svg
              viewBox="0 0 620 180"
              role="img"
              aria-label="Sample chart: delivery rises during the week; clicks remain below delivery"
              className="w-full"
            >
              <path
                d="M0 150H620 M0 100H620 M0 50H620"
                fill="none"
                stroke="#e5e8ef"
              />
              <path
                d="M0 140 C40 135 65 145 105 95 S175 115 210 90 S280 110 315 70 S385 85 420 55 S520 70 620 10 L620 180 L0 180Z"
                fill="#eeecff"
              />
              <path
                d="M0 140 C40 135 65 145 105 95 S175 115 210 90 S280 110 315 70 S385 85 420 55 S520 70 620 10"
                fill="none"
                stroke="#5146d9"
                strokeWidth="3"
              />
              <path
                d="M0 165 Q80 140 160 152 T320 140 T470 130 T620 120"
                fill="none"
                stroke="#157657"
                strokeWidth="2"
              />
            </svg>
            <div className="flex justify-between text-xs text-ui-muted mt-3">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Workspace health" />
          <CardBody>
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800 mb-4">
              <strong>All systems operational</strong>
              <p className="text-xs mt-1">
                Your workspace is ready for the next simulation.
              </p>
            </div>
            {[
              ["Sending profiles", "3 connected"],
              ["Landing pages", "6 published"],
              ["Background jobs", "No issues"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-3 py-3 border-b border-ui-border text-sm"
              >
                <span className="text-ui-muted">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Recent campaigns</h2>
        <p className="text-ui-muted text-xs mt-1">
          Sample data · sort and search the reusable table below.
        </p>
      </div>
      <DataTable
        {...table}
        data={campaigns}
        columns={campaignColumns}
        filters={campaignFilters}
        getRowId={getCampaignId}
        caption="Recent campaigns"
      />
      <Dialog
        open={notice}
        onOpenChange={setNotice}
        title="Notifications"
        description="You are up to date."
      >
        <p>No new notifications in this sample workspace.</p>
      </Dialog>
    </AppShell>
  );
}
const meta = {
  title: "Templates/Workspace",
  component: Workspace,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Workspace>;
export default meta;
export const Overview: StoryObj<typeof meta> = {};
export const Mobile: StoryObj<typeof meta> = {
  globals: { viewport: { value: "mobile", isRotated: false } },
};
