import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  emailStarterContent,
  pageStarterContent,
} from "../../../../apps/next-app/src/components/organisms/grapes-editor/starter-content";

function StarterPreview({
  mode = "email",
  mobile = false,
}: {
  mode?: "email" | "page";
  mobile?: boolean;
}) {
  return (
    <iframe
      title={`${mode} starter preview`}
      sandbox=""
      srcDoc={mode === "email" ? emailStarterContent : pageStarterContent}
      style={{
        width: mobile ? 390 : "100%",
        maxWidth: "100%",
        height: 720,
        border: "1px solid #e5e8ef",
        borderRadius: 12,
        background: "white",
      }}
    />
  );
}

const meta = {
  title: "Application/Editors/Starter content",
  component: StarterPreview,
} satisfies Meta<typeof StarterPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EmailDesktop: Story = {};
export const EmailMobile: Story = { args: { mobile: true } };
export const PageDesktop: Story = { args: { mode: "page" } };
export const PageMobile: Story = { args: { mode: "page", mobile: true } };
