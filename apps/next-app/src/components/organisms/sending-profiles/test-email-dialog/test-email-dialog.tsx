"use client";
import { Formik } from "formik";
import { useTestEmail } from "./hooks/use-test-email";
import { TestEmailDialogView } from "./parts/test-email-dialog-view";

interface Props {
  profileId: string;
  visible: boolean;
  onHide: () => void;
}
export function TestEmailDialog({ profileId, visible, onHide }: Props) {
  const model = useTestEmail(profileId);
  return (
    <Formik
      initialValues={{ toEmail: "" }}
      validate={model.validate}
      onSubmit={model.submit}
    >
      {({ resetForm }) => (
        <TestEmailDialogView
          visible={visible}
          pending={model.pending}
          status={model.status}
          onClose={() => {
            if (model.pending) return;
            resetForm();
            model.reset();
            onHide();
          }}
        />
      )}
    </Formik>
  );
}
