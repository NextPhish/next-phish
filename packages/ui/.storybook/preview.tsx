import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="np-theme">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    viewport: {
      options: {
        mobile: {
          name: "Mobile · 390px",
          styles: { width: "390px", height: "844px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet · 820px",
          styles: { width: "820px", height: "1180px" },
          type: "tablet",
        },
      },
    },
    a11y: { test: "error" },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};
export default preview;
