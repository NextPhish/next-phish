"use client";

import { Formik } from "formik";
import { Button, Dialog } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import { useAddMember } from "./hooks/use-add-member";
import { AddMemberFields } from "./parts/add-member-fields";

export function AddMember({
  organizationId,
  onCreated,
  onCancel,
}: {
  organizationId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const form = useAddMember(organizationId, onCreated);
  const t = useTranslation();
  if (form.existing) {
    return (
      <Dialog
        open
        onOpenChange={(open) =>
          !open && !form.confirmingExisting && form.cancelExisting()
        }
        title={t("organizations.existingMemberTitle")}
        description={t("organizations.existingMemberDescription", {
          email: form.existing.email,
        })}
        closeLabel={t("common.close")}
        dismissible={!form.confirmingExisting}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={form.confirmingExisting}
              onClick={form.cancelExisting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              loading={form.confirmingExisting}
              onClick={() => void form.confirmExisting()}
            >
              {t("organizations.addExistingMember")}
            </Button>
          </>
        }
      >
        <p>{t("organizations.existingMemberOnlyAccess")}</p>
      </Dialog>
    );
  }
  return (
    <Formik
      initialValues={{ organizationId, name: "", email: "" }}
      validate={form.validate}
      onSubmit={form.submit}
    >
      <AddMemberFields
        error={form.error}
        welcomeWarning={form.welcomeWarning}
        retrying={form.retrying}
        onRetryWelcome={() => void form.retryWelcome()}
        onCancel={onCancel}
        needsName={form.needsName}
      />
    </Formik>
  );
}
