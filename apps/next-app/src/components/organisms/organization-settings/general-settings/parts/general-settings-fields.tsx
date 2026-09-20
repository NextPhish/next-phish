"use client";

import { Field, Form, useFormikContext } from "formik";
import { Button, FormField, FormMessage, Input } from "@next-phish/ui";
import type { UpdateOrganizationInput } from "@next-phish/shared";
import type { FormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

interface GeneralSettingsFieldsProps {
  status: FormStatus;
}

export function GeneralSettingsFields({ status }: GeneralSettingsFieldsProps) {
  const t = useTranslation();
  const { isSubmitting, errors, touched } =
    useFormikContext<UpdateOrganizationInput>();

  return (
    <Form className="flex max-w-[640px] flex-col gap-5" noValidate>
      <FormField
        id="organization-name"
        label={t("organizations.organizationName")}
        required
        error={touched.name ? errors.name : undefined}
      >
        {(control) => (
          <Field
            as={Input}
            name="name"
            placeholder={t("organizations.organizationName")}
            {...control}
          />
        )}
      </FormField>
      <FormField
        id="organization-slug"
        label={t("organizations.slug")}
        hint={t("organizations.slugHint")}
        required
        error={touched.slug ? errors.slug : undefined}
      >
        {(control) => (
          <Field
            as={Input}
            name="slug"
            placeholder="acme-corporation"
            {...control}
          />
        )}
      </FormField>

      {status.type === "error" && (
        <FormMessage variant="error">{status.message}</FormMessage>
      )}
      {status.type === "success" && (
        <FormMessage variant="success">{status.message}</FormMessage>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-fit"
      >
        {t("common.saveChanges")}
      </Button>
    </Form>
  );
}
