"use client";

import { Formik } from "formik";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { TestEmailDialog } from "../test-email-dialog";
import { useSendingProfileForm } from "./hooks/use-sending-profile-form";
import { SendingProfileFormView } from "./parts/sending-profile-form-view";
import {
  SendingProfileFormError,
  SendingProfileFormLoading,
  SendingProfileFormNotFound,
} from "./parts/sending-profile-form-status";

export function SendingProfileForm({ profileId }: { profileId?: string }) {
  const model = useSendingProfileForm(profileId);
  if (profileId && model.profileQuery.isLoading)
    return <SendingProfileFormLoading t={model.t} />;
  if (model.profileQuery.error)
    return (
      <SendingProfileFormError
        t={model.t}
        onRetry={() => void model.profileQuery.refetch()}
      />
    );
  if (profileId && !model.profileQuery.data)
    return <SendingProfileFormNotFound t={model.t} />;
  return (
    <>
      <Formik<SendingProfileFormValues>
        initialValues={model.initialValues}
        validate={model.validate}
        onSubmit={model.submit}
        enableReinitialize
      >
        <SendingProfileFormView
          error={model.error}
          isEdit={Boolean(profileId)}
          onCancel={model.cancel}
          onTest={model.openTestDialog}
        />
      </Formik>
      {profileId && (
        <TestEmailDialog
          profileId={profileId}
          visible={model.showTestDialog}
          onHide={model.closeTestDialog}
        />
      )}
    </>
  );
}
