import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogClose, Button } from "../index";
const meta = {
  title: "Molecules/Dialog",
  component: Dialog,
  args: {
    title: "Campaign details",
    description: "Review the simulation before returning to your workspace.",
    trigger: <Button>Open dialog</Button>,
    children: <p>This campaign targets the engineering awareness group.</p>,
    footer: (
      <DialogClose asChild>
        <Button>Done</Button>
      </DialogClose>
    ),
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={`section-${i}`}>
            Section {i + 1}: campaign content remains scrollable within the
            viewport. The dialog keeps keyboard focus inside until it closes.
          </p>
        ))}
      </div>
    ),
  },
};
