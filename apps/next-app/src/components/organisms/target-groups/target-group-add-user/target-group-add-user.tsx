"use client";

import { Formik } from "formik";
import {
  useTargetGroupAddUser,
  initialAddUserValues,
} from "./hooks/use-target-group-add-user";
import { TargetGroupAddUserFields } from "./parts/target-group-add-user-fields";

interface Props {
  visible: boolean;
  onHide: () => void;
  targetGroupId: string;
}

export function TargetGroupAddUser({ visible, onHide, targetGroupId }: Props) {
  const form = useTargetGroupAddUser(targetGroupId, onHide);
  return (
    <Formik
      initialValues={initialAddUserValues}
      validate={form.validate}
      onSubmit={form.onSubmit}
    >
      <TargetGroupAddUserFields
        visible={visible}
        onHide={onHide}
        error={form.error}
      />
    </Formik>
  );
}
