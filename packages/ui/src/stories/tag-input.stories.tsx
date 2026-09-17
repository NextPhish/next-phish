import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagInput } from "../molecules/tag-input";

const meta = { title: "Fields/TagInput", component: TagInput } satisfies Meta<
  typeof TagInput
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: ["security", "training"],
    onValueChange: () => {},
    "aria-label": "Add tags",
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <div style={{ maxWidth: 520 }}>
        <TagInput {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};
