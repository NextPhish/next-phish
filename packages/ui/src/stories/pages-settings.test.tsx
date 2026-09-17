import { Formik } from "formik";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { PageSettingsPresentation } from "../../../../apps/next-app/src/components/organisms/pages/page-settings-presentation";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { demoPages } from "./pages.stories";

function Settings({ select = vi.fn() }: { select?: (id: string) => void }) {
  const t = useTranslation();
  return (
    <Formik
      initialValues={{
        name: "Sign in",
        path: "login",
        type: "LANDING" as const,
        status: "DRAFT" as const,
        redirectTarget: "page" as const,
        redirectPageId: null,
        redirectUrl: null,
      }}
      onSubmit={() => {}}
    >
      {({ values, setFieldValue }) => (
        <PageSettingsPresentation
          t={t}
          values={values}
          setFieldValue={async (field, value) => {
            if (field === "redirectPageId" && value) select(String(value));
            await setFieldValue(field, value);
          }}
          selectorVisible
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
      )}
    </Formik>
  );
}
it("selects the active redirect-page id from the visual catalog", async () => {
  const select = vi.fn();
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <Settings select={select} />
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: /Select Security training/ }),
  );
  expect(select).toHaveBeenCalledWith("redirect");
});
