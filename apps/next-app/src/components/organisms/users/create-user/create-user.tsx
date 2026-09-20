"use client";

import { Formik } from "formik";
import type { AdminCreateUserInput } from "@next-phish/shared";
import {
  useCreateUser,
  initialCreateUserValues,
} from "./hooks/use-create-user";
import { CreateUserFields } from "./parts/create-user-fields";

interface CreateUserProps {
  visible: boolean;
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateUser({ visible, onCreated, onCancel }: CreateUserProps) {
  const form = useCreateUser(onCreated);
  return (
    <Formik<AdminCreateUserInput>
      initialValues={initialCreateUserValues}
      validate={form.validate}
      onSubmit={form.submit}
    >
      <CreateUserFields
        organizations={form.organizations}
        organizationsLoading={form.organizationsLoading}
        visible={visible}
        error={form.error}
        onCancel={onCancel}
      />
    </Formik>
  );
}
