import { Formik } from "formik";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageSettingsView } from "../../../../apps/next-app/src/components/organisms/pages/page-form/page-settings/parts/page-settings-view";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { demoPages } from "./pages.stories";

function Preview({ redirect = false }: { redirect?: boolean }) {
  return (
    <I18nProvider initialLocale="en">
      <PreviewContent redirect={redirect} />
    </I18nProvider>
  );
}
function PreviewContent({ redirect }: { redirect: boolean }) {
  const t = useTranslation();
  return (
    <Formik
      initialValues={{
        name: "Training landing page",
        path: "login",
        type: "LANDING" as const,
        status: "DRAFT" as const,
        redirectTarget: redirect ? ("page" as const) : ("none" as const),
        redirectPageId: null,
        redirectUrl: null,
      }}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => (
        <div className="np-theme" style={{ maxWidth: 360, padding: 20 }}>
          <PageSettingsView
            t={t}
            values={values}
            setFieldValue={setFieldValue}
            selectorVisible={redirect}
            onSelectorVisibleChange={() => {}}
            pages={demoPages.filter((page) => page.type === "REDIRECT")}
            pagesTotal={1}
            pagesLoading={false}
            search=""
            offset={0}
            limit={6}
            onSearch={() => {}}
            onPage={() => {}}
          />
        </div>
      )}
    </Formik>
  );
}
const meta = {
  title: "Screens/Pages/Settings",
  component: Preview,
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Draft: Story = {};
export const RedirectSelection: Story = { args: { redirect: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
