"use client";
import { Form, Field, useFormikContext, type FieldInputProps } from "formik";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import { slugify } from "../../../lib/slugify";
import { useTranslation } from "../../../lib/i18n";
import type { SlugStatus } from "../../../hooks/slug-availability.types";
import styles from "./onboarding.module.css";
export interface OnboardingValues {
  name: string;
  slug: string;
}
export function OnboardingPresentation({
  error,
  slugStatus = "idle",
  onCancel,
}: {
  error: string;
  slugStatus?: SlugStatus;
  onCancel?: () => void;
}) {
  const t = useTranslation();
  const { values, errors, touched, isSubmitting, setValues } =
    useFormikContext<OnboardingValues>();
  return (
    <div className={styles.content}>
      {!onCancel && (
        <FormMessage variant="info" title={t("onboarding.infoTitle")}>
          {t("onboarding.infoBody")}
        </FormMessage>
      )}
      <Form noValidate className={styles.form}>
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
        {slugStatus !== "idle" && (
          <div className={styles.slugStatus}>
            <FormMessage
              variant={
                slugStatus === "available"
                  ? "success"
                  : slugStatus === "checking"
                    ? "info"
                    : "error"
              }
            >
              {t(
                slugStatus === "error"
                  ? "onboarding.slugCheckError"
                  : `common.${slugStatus}`,
              )}
            </FormMessage>
          </div>
        )}
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <div className={onCancel ? styles.dialogActions : styles.actions}>
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              slugStatus === "taken" ||
              slugStatus === "checking"
            }
          >
            {t(onCancel ? "common.create" : "onboarding.createOrganization")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
