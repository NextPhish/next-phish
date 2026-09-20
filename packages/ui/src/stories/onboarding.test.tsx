import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { createOrganizationSchema } from "@next-phish/shared";
import { OnboardingView } from "../../../../apps/next-app/src/components/organisms/onboarding/parts/onboarding-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
it("generates slugs while preserving manual edits and validates before creating an organization", async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={{ name: "", slug: "" }}
        validate={toFormikValidation(createOrganizationSchema)}
        onSubmit={submit}
      >
        <OnboardingView error="" />
      </Formik>
    </I18nProvider>,
  );
  await user.type(
    screen.getByRole("textbox", { name: "Organization name" }),
    "Acme Security",
  );
  expect(screen.getByRole("textbox", { name: "Slug" })).toHaveValue(
    "acme-security",
  );
  await user.clear(screen.getByRole("textbox", { name: "Slug" }));
  await user.type(screen.getByRole("textbox", { name: "Slug" }), "my-team");
  await user.type(
    screen.getByRole("textbox", { name: "Organization name" }),
    " Updated",
  );
  expect(screen.getByRole("textbox", { name: "Slug" })).toHaveValue("my-team");
  await user.clear(screen.getByRole("textbox", { name: "Slug" }));
  await user.type(
    screen.getByRole("textbox", { name: "Slug" }),
    "Invalid Slug!",
  );
  await user.click(screen.getByRole("button", { name: "Create organization" }));
  expect(
    await screen.findByText(
      "Use lowercase letters, numbers, and single hyphens between words.",
    ),
  ).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});
