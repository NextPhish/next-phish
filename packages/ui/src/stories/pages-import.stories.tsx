import { Formik } from "formik";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImportWebsiteView } from "../../../../apps/next-app/src/components/organisms/pages/import-website/parts/import-website-view";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";

function Preview({ progress = false }: { progress?: boolean }) {
  return (
    <I18nProvider initialLocale="en">
      <PreviewContent progress={progress} />
    </I18nProvider>
  );
}
function PreviewContent({ progress }: { progress: boolean }) {
  const t = useTranslation();
  const state = progress
    ? {
        url: "https://example.com",
        includeAssets: true,
        importing: true,
        error: "",
        jobId: "job-1",
        progress: {
          status: "running",
          discovered: 18,
          downloaded: 11,
          failed: 1,
        },
      }
    : {
        url: "",
        includeAssets: true,
        importing: false,
        error: "",
        jobId: null,
        progress: null,
      };
  return (
    <Formik
      initialValues={{ url: "https://example.com/login" }}
      onSubmit={() => {}}
    >
      <ImportWebsiteView
        visible
        t={t}
        state={state}
        previousImports={[]}
        onIncludeAssetsChange={() => {}}
        onSelectPrevious={() => {}}
        onSearch={() => {}}
        onHide={() => {}}
      />
    </Formik>
  );
}
const meta = {
  title: "Screens/Pages/Import website",
  component: Preview,
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Form: Story = {};
export const ImportingAssets: Story = { args: { progress: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
