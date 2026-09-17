import type { Meta, StoryObj } from "@storybook/react-vite";
import { TargetGroupImportFixture } from "./target-groups.stories";
const meta = {
  title: "Screens/Target Groups/Import",
  component: TargetGroupImportFixture,
} satisfies Meta<typeof TargetGroupImportFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Configure: Story = {};
export const Importing: Story = { args: { status: "importing" } };
export const Results: Story = { args: { status: "done" } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
