import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserCreateFixture } from "./users-admin.stories";
const meta = {
  title: "Screens/Admin Users/Create",
  component: UserCreateFixture,
} satisfies Meta<typeof UserCreateFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ExistingOrganization: Story = {};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
