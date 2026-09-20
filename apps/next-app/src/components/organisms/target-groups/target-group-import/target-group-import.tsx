"use client";

import { Formik } from "formik";
import {
  useTargetGroupImportDialog,
  initialImportValues,
} from "./hooks/use-target-group-import-dialog";
import { TargetGroupImportView } from "./parts/target-group-import-view";

interface Props {
  visible: boolean;
  onHide: () => void;
  targetGroupId: string;
}

export function TargetGroupImport({ visible, onHide, targetGroupId }: Props) {
  const model = useTargetGroupImportDialog(targetGroupId, onHide);
  return (
    <Formik
      initialValues={initialImportValues}
      validate={model.validate}
      onSubmit={model.handleImport}
    >
      {(formik) => (
        <TargetGroupImportView visible={visible} {...model.viewProps(formik)} />
      )}
    </Formik>
  );
}
