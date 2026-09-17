"use client";
import { Form, Field, useFormikContext } from "formik";
import {
  Dialog,
  Input,
  Select,
  Button,
  Checkbox,
  MultiSelect,
  FormField,
  FormMessage,
} from "@next-phish/ui";
import {
  PERMISSION_GROUPS,
  TIME_WINDOW_OPTIONS,
  type CreateApiKeyFormValues,
} from "@next-phish/shared";
import { useTranslation } from "../../../lib/i18n";

interface Props {
  visible: boolean;
  onHide: () => void;
  error: string;
  organizations: { id: string; name: string }[];
  organizationsLoading?: boolean;
  organizationsError?: boolean;
}
export function ApiKeyForm({
  visible,
  onHide,
  error,
  organizations,
  organizationsLoading,
  organizationsError,
}: Props) {
  const t = useTranslation();
  const { values, setFieldValue, isSubmitting, errors, touched } =
    useFormikContext<CreateApiKeyFormValues>();
  const fieldError = (name: keyof CreateApiKeyFormValues, key: string) =>
    touched[name] && errors[name] ? t(key) : undefined;
  return (
    <Dialog
      title={t("apiKeys.createTitle")}
      description={t("apiKeys.subtitle")}
      closeLabel={t("common.cancel")}
      open={visible}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onHide();
      }}
    >
      <Form noValidate className="grid gap-5">
        <FormField
          label={t("apiKeys.name")}
          error={fieldError("name", "apiKeys.validation.nameTooLong")}
        >
          {(control) => (
            <Field
              as={Input}
              {...control}
              name="name"
              placeholder={t("apiKeys.namePlaceholder")}
              disabled={isSubmitting}
            />
          )}
        </FormField>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <Checkbox
              checked={values.limitToOrganizations}
              onCheckedChange={(checked) =>
                void setFieldValue("limitToOrganizations", checked === true)
              }
              disabled={isSubmitting}
            />
            {t("apiKeys.limitToOrganizations")}
          </label>
          {values.limitToOrganizations && (
            <FormField
              label={t("apiKeys.organizations")}
              error={fieldError(
                "organizationIds",
                "apiKeys.validation.organizationsRequired",
              )}
            >
              {(control) => (
                <MultiSelect
                  {...control}
                  value={values.organizationIds}
                  onValueChange={(value) =>
                    void setFieldValue("organizationIds", value)
                  }
                  options={organizations.map((org) => ({
                    label: org.name,
                    value: org.id,
                  }))}
                  loading={organizationsLoading}
                  loadingLabel={t("common.loading")}
                  disabled={isSubmitting || organizationsError}
                  placeholder={t("apiKeys.selectOrganizations")}
                  labels={{
                    search: t("common.search"),
                    empty: t("common.noRecordsFound"),
                    selected: (count) => t("tableUi.selected", { count }),
                    remove: (label) => t("tableUi.remove", { label }),
                    clear: t("tableUi.clearSelection"),
                    done: t("apiKeys.done"),
                    options: t("apiKeys.organizations"),
                  }}
                />
              )}
            </FormField>
          )}
          {values.limitToOrganizations && organizationsError && (
            <FormMessage variant="error">
              {t("apiKeys.organizationsError")}
            </FormMessage>
          )}
        </div>
        <fieldset className="m-0 min-w-0 rounded-lg border border-ui-border p-4">
          <legend className="px-1 text-sm font-semibold">
            {t("apiKeys.permissions")}
          </legend>
          <table
            className="w-full border-collapse text-sm"
            aria-label={t("apiKeys.permissions")}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="pb-3 text-left font-medium text-ui-muted"
                >
                  {t("apiKeys.resource")}
                </th>
                <th
                  scope="col"
                  className="w-20 pb-3 text-center font-medium text-ui-muted"
                >
                  {t("apiKeys.read")}
                </th>
                <th
                  scope="col"
                  className="w-20 pb-3 text-center font-medium text-ui-muted"
                >
                  {t("apiKeys.write")}
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <tr key={group.resource}>
                  <th
                    scope="row"
                    className="py-2 text-left font-normal text-ui-muted"
                  >
                    {t(`apiKeys.resources.${group.resource}`)}
                  </th>
                  {[group.read, group.write].map((scope, index) => (
                    <td
                      key={scope ?? "unavailable"}
                      className="py-2 text-center"
                    >
                      {scope ? (
                        <Checkbox
                          aria-label={`${t(`apiKeys.resources.${group.resource}`)}: ${t(index === 0 ? "apiKeys.read" : "apiKeys.write")}`}
                          checked={!!values.permissions[scope]}
                          disabled={isSubmitting}
                          onCheckedChange={(checked) =>
                            void setFieldValue(
                              `permissions.${scope}`,
                              checked === true,
                            )
                          }
                        />
                      ) : (
                        <span aria-hidden="true">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
        <FormField
          label={t("apiKeys.expiration")}
          error={fieldError(
            "expiresInDays",
            "apiKeys.validation.expirationInvalid",
          )}
        >
          {(control) => (
            <Select
              {...control}
              disabled={isSubmitting}
              value={
                values.expiresInDays === null
                  ? "never"
                  : String(values.expiresInDays)
              }
              onValueChange={(value) =>
                void setFieldValue(
                  "expiresInDays",
                  value === "never" ? null : Number(value),
                )
              }
              options={[
                { label: t("apiKeys.neverExpires"), value: "never" },
                ...[30, 60, 90, 365].map((days) => ({
                  label: `${days} ${t("apiKeys.days")}`,
                  value: String(days),
                })),
              ]}
            />
          )}
        </FormField>
        <div className="space-y-4 rounded-lg border border-ui-border p-4">
          <label className="flex items-center gap-3">
            <Checkbox
              checked={values.rateLimitEnabled}
              disabled={isSubmitting}
              onCheckedChange={(checked) =>
                void setFieldValue("rateLimitEnabled", checked === true)
              }
            />
            {t("apiKeys.rateLimit")}
          </label>
          {values.rateLimitEnabled && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={t("apiKeys.maxRequests")}
                error={fieldError(
                  "rateLimitMax",
                  "apiKeys.validation.requestsInvalid",
                )}
                required
              >
                {(control) => (
                  <Input
                    {...control}
                    type="number"
                    min={1}
                    step={1}
                    value={values.rateLimitMax ?? ""}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      void setFieldValue(
                        "rateLimitMax",
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    name="rateLimitMax"
                  />
                )}
              </FormField>
              <FormField
                label={t("apiKeys.timeWindow")}
                error={fieldError(
                  "rateLimitTimeWindow",
                  "apiKeys.validation.windowInvalid",
                )}
                required
              >
                {(control) => (
                  <Select
                    {...control}
                    disabled={isSubmitting}
                    value={
                      values.rateLimitTimeWindow === null
                        ? ""
                        : String(values.rateLimitTimeWindow)
                    }
                    onValueChange={(value) =>
                      void setFieldValue("rateLimitTimeWindow", Number(value))
                    }
                    options={TIME_WINDOW_OPTIONS.map((option) => ({
                      label: t(option.translationKey),
                      value: String(option.value),
                    }))}
                  />
                )}
              </FormField>
            </div>
          )}
        </div>
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={
              values.limitToOrganizations &&
              (organizationsLoading || organizationsError)
            }
          >
            {t("apiKeys.create")}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
