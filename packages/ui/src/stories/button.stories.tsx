import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "../index";
const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Create campaign" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Danger: Story = {
  args: { variant: "danger", children: "Delete campaign" },
};
export const Ghost: Story = { args: { variant: "ghost", children: "Cancel" } };
export const Loading: Story = {
  args: { loading: true, children: "Creating campaign…" },
};
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus size={16} aria-hidden="true" />
        New campaign
      </>
    ),
  },
};
