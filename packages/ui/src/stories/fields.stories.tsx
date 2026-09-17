import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField, Input, Textarea, NativeSelect, Checkbox } from "../index";
const meta = {
  title: "Molecules/FormField",
  component: FormField,
  args: {
    label: "Campaign name",
    hint: "A clear name helps your team find this simulation.",
    children: (props) => (
      <Input {...props} placeholder="September security awareness" />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Invalid: Story = {
  args: { error: "Enter a campaign name.", required: true },
};
export const Disabled: Story = {
  args: {
    children: (props) => (
      <Input {...props} disabled defaultValue="Archived campaign" />
    ),
  },
};
export const Multiline: Story = {
  args: {
    label: "Description",
    children: (props) => (
      <Textarea
        {...props}
        placeholder="Describe the purpose of this simulation…"
      />
    ),
  },
};
export const Options: Story = {
  args: {
    label: "Sending profile",
    children: (props) => (
      <NativeSelect {...props}>
        <option value="">Choose a profile</option>
        <option value="internal">Internal SMTP</option>
      </NativeSelect>
    ),
  },
};
export const Check: Story = {
  args: {
    label: "Enable tracking",
    hint: "Collect aggregate engagement events.",
    children: (props) => <Checkbox {...props} defaultChecked />,
  },
};
