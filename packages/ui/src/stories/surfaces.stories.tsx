import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mail } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  EmptyState,
  MetricCard,
  Skeleton,
} from "../index";
const meta = { title: "Molecules/Surfaces", component: Card } satisfies Meta<
  typeof Card
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Panel: Story = {
  render: () => (
    <Card>
      <CardHeader
        title="Campaign activity"
        description="Engagement across your active simulations."
        action={<Badge tone="success">Live</Badge>}
      />
      <CardBody>Reusable header, content and footer slots.</CardBody>
      <CardFooter>Updated just now</CardFooter>
    </Card>
  ),
};
export const StatusBadges: Story = {
  render: () => (
    <div className="np-actions">
      <Badge>Draft</Badge>
      <Badge tone="info">Scheduled</Badge>
      <Badge tone="success">Running</Badge>
      <Badge tone="warning">Paused</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  ),
};
export const Empty: Story = {
  render: () => (
    <Card>
      <EmptyState
        title="Your first campaign starts here"
        description="Create a simulation to help your team recognize suspicious emails."
        icon={<Mail />}
        action={<Button>Create campaign</Button>}
      />
    </Card>
  ),
};
export const Metric: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <MetricCard
        label="Emails delivered"
        value="4,218"
        detail="Across 12 active campaigns"
        icon={<Mail size={18} />}
      />
    </div>
  ),
};
export const Loading: Story = {
  render: () => (
    <Card>
      <CardBody>
        <div role="status" aria-label="Loading campaign">
          <Skeleton className="w-1/3 mb-4" />
          <Skeleton className="h-32" />
        </div>
      </CardBody>
    </Card>
  ),
};
