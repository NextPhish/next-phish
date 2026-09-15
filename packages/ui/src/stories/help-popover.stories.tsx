import type { Meta, StoryObj } from "@storybook/react-vite";
import { HelpPopover } from "../index";

const meta = {
  title: "Molecules/HelpPopover",
  component: HelpPopover,
  args: {
    label: "Pending publications",
    children: "Prepared delivery jobs waiting to enter the worker queue.",
  },
} satisfies Meta<typeof HelpPopover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
