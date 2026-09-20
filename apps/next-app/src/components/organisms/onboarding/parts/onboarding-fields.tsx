import { Field, useFormikContext, type FieldInputProps } from "formik";
import { FormField, Input } from "@next-phish/ui";
import { slugify } from "../../../../lib/slugify";
import { useTranslation } from "../../../../lib/i18n";
import type { OnboardingValues } from "./onboarding-view";

export function OnboardingFields() {
  const t = useTranslation();
  const { values, errors, touched, isSubmitting, setValues } =
    useFormikContext<OnboardingValues>();

  return (
    <>
      <FormField
        id="organization-name"
        label={t("onboarding.organizationName")}
        required
        error={
          touched.name && errors.name
            ? t("onboarding.validation.nameRequired")
            : undefined
        }
      >
        {(control) => (
          <Field name="name">
            {({ field }: { field: FieldInputProps<string> }) => (
              <Input
                {...control}
                {...field}
                disabled={isSubmitting}
                placeholder="Acme Security"
                autoComplete="organization"
                onChange={(event) => {
                  const name = event.target.value;
                  void setValues({
                    ...values,
                    name,
                    slug:
                      !values.slug || values.slug === slugify(values.name)
                        ? slugify(name)
                        : values.slug,
                  });
                }}
              />
            )}
          </Field>
        )}
      </FormField>
      <FormField
        id="organization-slug"
        label={t("organizations.slug")}
        required
        hint={t("organizations.slugHint")}
        error={
          touched.slug && errors.slug
            ? t(
                values.slug
                  ? "onboarding.validation.slugInvalid"
                  : "onboarding.validation.slugRequired",
              )
            : undefined
        }
      >
        {(control) => (
          <Field
            as={Input}
            {...control}
            name="slug"
            disabled={isSubmitting}
            placeholder="acme-security"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        )}
      </FormField>
    </>
  );
}
