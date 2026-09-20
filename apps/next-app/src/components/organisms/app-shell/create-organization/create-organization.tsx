"use client";

import { Formik } from "formik";
import { Dialog, type DialogProps } from "@next-phish/ui";
import { createOrganizationSchema } from "@next-phish/shared";
import { CreateOrganizationForm } from "./parts/create-organization-form";
import { useMyOrganizations } from "../hooks/use-my-organizations";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { useTranslation } from "@/src/lib/i18n";

interface CreateOrganizationProps {
  visible: boolean;
  onHide: () => void;
  onCloseAutoFocus?: DialogProps["onCloseAutoFocus"];
}

export function CreateOrganization({
  visible,
  onHide,
  onCloseAutoFocus,
}: CreateOrganizationProps) {
  const t = useTranslation();
  const { create, setActive } = useMyOrganizations();
  const { status, setError, reset } = useFormStatus();

  async function handleSubmit(values: { name: string; slug: string }) {
    reset();
    try {
      const org = await create.mutateAsync(values);
      if (org && "id" in org) await setActive(org.id as string);
      onHide();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t("organizations.createError"),
      );
    }
  }
  function close() {
    if (create.isPending) return;
    reset();
    onHide();
  }
  return (
    <Dialog
      onCloseAutoFocus={onCloseAutoFocus}
      open={visible}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={t("organizations.createTitle")}
      description={t("onboarding.subtitle")}
      closeLabel={t("common.cancel")}
    >
      <Formik
        initialValues={{ name: "", slug: "" }}
        validate={toFormikValidation(createOrganizationSchema)}
        onSubmit={handleSubmit}
      >
        <CreateOrganizationForm
          error={status.type === "error" ? status.message : ""}
          onCancel={close}
        />
      </Formik>
    </Dialog>
  );
}
