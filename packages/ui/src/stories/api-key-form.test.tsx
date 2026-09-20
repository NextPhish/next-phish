import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import {
  createApiKeyFormSchema,
  type CreateApiKeyFormValues,
} from "@next-phish/shared";
import { ApiKeyFields } from "../../../../apps/next-app/src/components/organisms/settings/api-key-form/parts/api-key-fields";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { toFormikValidation } from "../../../../apps/next-app/src/lib/to-formik-validation";
const initialValues: CreateApiKeyFormValues = {
  name: "Automation",
  limitToOrganizations: false,
  organizationIds: [],
  permissions: {},
  expiresInDays: 90,
  rateLimitEnabled: true,
  rateLimitMax: 1000,
  rateLimitTimeWindow: 3600000,
};
function form(submit: (values: CreateApiKeyFormValues) => Promise<void>) {
  return (
    <I18nProvider initialLocale="en">
      <Formik
        initialValues={initialValues}
        validate={toFormikValidation(createApiKeyFormSchema)}
        onSubmit={submit}
      >
        <ApiKeyFields
          visible
          onHide={() => {}}
          error=""
          organizations={[{ id: "example", name: "Example" }]}
        />
      </Formik>
    </I18nProvider>
  );
}
it("submits edited request limits as numbers accepted by the schema", async () => {
  const submit = vi.fn(async () => {});
  const user = userEvent.setup();
  render(form(submit));
  const input = screen.getByRole("spinbutton", { name: "Max requests" });
  await user.clear(input);
  await user.type(input, "500");
  await user.click(screen.getByRole("button", { name: "Create API key" }));
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({ rateLimitMax: 500 }),
    expect.anything(),
  );
});
it("does not create an unrestricted key when organization scoping is selected without an organization", async () => {
  const submit = vi.fn(async () => {});
  const user = userEvent.setup();
  render(form(submit));
  await user.click(
    screen.getByRole("checkbox", { name: "Limit to specific organizations" }),
  );
  await user.click(screen.getByRole("button", { name: "Create API key" }));
  expect(
    await screen.findByText("Select at least one organization."),
  ).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});
