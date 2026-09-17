import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserDeletionFixture } from "./users-admin.stories";
const meta = {
  title: "Screens/Admin Users/Delete",
  component: UserDeletionFixture,
} satisfies Meta<typeof UserDeletionFixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OwnedDataAndOrphans: Story = {};
export const PreviewLoading: Story = { args: { state: "loading" } };
export const PreviewError: Story = { args: { state: "error" } };
