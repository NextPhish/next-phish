import type { Meta, StoryObj } from "@storybook/react-vite";
import { TargetGroupFormFixture } from "./target-groups.stories";
const meta = {
  title: "Screens/Target Groups/Form",
  component: TargetGroupFormFixture,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TargetGroupFormFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
