import type { Meta, StoryObj } from "@storybook/react-vite";
import { HelpTooltip } from "../index";

const meta = {
  title: "Molecules/HelpTooltip",
  component: HelpTooltip,
  args: {
    label: "About page types",
    children:
      "Landing pages display authored content. Redirect pages send the visitor to another page or URL.",
  },
} satisfies Meta<typeof HelpTooltip>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
