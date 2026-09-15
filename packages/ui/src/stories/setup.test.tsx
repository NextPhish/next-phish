import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { setupSchema } from "@next-phish/shared";
import { SetupPresentation } from "../../../../apps/next-app/src/components/organisms/setup/presentation";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";

it.each([
  {
    locale: "en" as const,
    submit: "Create account",
    name: "Name is required",
    email: "Invalid email address",
    password: "Use at least 8 characters",
  },
  {
    locale: "bg" as const,
    submit: "Създай акаунт",
    name: "Името е задължително",
    email: "Невалиден имейл адрес",
    password: "Използвайте поне 8 символа",
  },
])(
  "blocks invalid setup submissions and localizes errors in $locale",
  async (copy) => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale={copy.locale}>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validate={toFormikValidation(setupSchema)}
          onSubmit={submit}
        >
          <SetupPresentation error="" />
        </Formik>
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.name)).toBeInTheDocument();
    expect(screen.getByText(copy.email)).toBeInTheDocument();
    expect(screen.getByText(copy.password)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  },
);
