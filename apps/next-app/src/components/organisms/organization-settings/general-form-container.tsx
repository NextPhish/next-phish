"use client";

import { Formik } from "formik";
import type { OrganizationView } from "@next-phish/backend";
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n";
import { GeneralFormPresentation } from "./general-form-presentation";
import { localizedZodValidation } from "./organization-settings-validation";

interface GeneralFormContainerProps {
  organization: OrganizationView;
}

export function GeneralFormContainer({
  organization,
}: GeneralFormContainerProps) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const update = trpc.organization.update.useMutation();

  async function handleSubmit(values: UpdateOrganizationInput) {
    reset();
    try {
      await update.mutateAsync({ organizationId: organization.id, ...values });
      await Promise.all([
        utils.organization.getById.invalidate({
          organizationId: organization.id,
        }),
        utils.organization.list.invalidate(),
      ]);
      setSuccess(t("organizations.updated"));
    } catch {
      setError(t("organizations.updateError"));
    }
  }

  return (
    <Formik<UpdateOrganizationInput>
      enableReinitialize
      initialValues={{ name: organization.name, slug: organization.slug }}
      validate={localizedZodValidation(updateOrganizationSchema, t)}
      onSubmit={handleSubmit}
    >
      <GeneralFormPresentation status={status} />
    </Formik>
  );
}
