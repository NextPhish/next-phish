"use client";
import { Field, Form, getIn, useFormikContext } from "formik";
import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  FormErrorSummary,
  FormField,
  FormMessage,
  Input,
  Select,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./target-groups.module.css";
export interface FormUser {
  _key: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
}
export interface TargetGroupFormValues {
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  users: FormUser[];
}
interface Props {
  error: string;
  success: string;
  isEdit: boolean;
  onCancel?: () => void;
}
export function TargetGroupFormPresentation({
  error,
  success,
  isEdit,
  onCancel,
}: Props) {
  const t = useTranslation();
  const { values, errors, touched, setFieldValue, isSubmitting } =
    useFormikContext<TargetGroupFormValues>();
  const addUser = () =>
    void setFieldValue("users", [
      ...values.users,
      {
        _key: crypto.randomUUID(),
        email: "",
        firstName: "",
        lastName: "",
        position: "",
      },
    ]);
  const removeUser = (index: number) =>
    void setFieldValue(
      "users",
      values.users.filter((_, position) => position !== index),
    );
  const summary = Object.entries(errors).flatMap(([key, value]) =>
    key === "users" && Array.isArray(value)
      ? value.flatMap((row, index) =>
          row && typeof row === "object"
            ? Object.entries(row)
                .filter(([, issue]) => typeof issue === "string")
                .map(([field, issue]) => ({
                  id: `target-group-user-${values.users[index]?._key}-${field}`,
                  message: String(issue),
                }))
            : [],
        )
      : typeof value === "string"
        ? [
            {
              id: key === "name" ? "target-group-name" : "target-group-status",
              message: value,
            },
          ]
        : [],
  );
  return (
    <Form className="grid gap-6">
      <FormErrorSummary
        errors={summary}
        title={t("targetGroups.correctErrors")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="name">
          {({ field }: { field: Record<string, unknown> }) => (
            <FormField
              id="target-group-name"
              label={t("targetGroups.name")}
              error={touched.name ? errors.name : undefined}
            >
              {(control) => (
                <Input
                  {...control}
                  {...field}
                  placeholder={t("targetGroups.namePlaceholder")}
                />
              )}
            </FormField>
          )}
        </Field>
        <FormField id="target-group-status" label={t("targetGroups.status")}>
          {(control) => (
            <Select
              {...control}
              value={values.status}
              options={[
                { value: "DRAFT", label: t("common.draft") },
                { value: "ACTIVE", label: t("common.active") },
                { value: "ARCHIVED", label: t("targetGroups.archived") },
              ]}
              onValueChange={(value) => void setFieldValue("status", value)}
            />
          )}
        </FormField>
      </div>
      {!isEdit && (
        <section className="grid gap-4">
          <div className={styles.heading}>
            <h2>{t("targetGroups.users")}</h2>
            <Button type="button" variant="secondary" onClick={addUser}>
              <Plus size={16} aria-hidden="true" />
              {t("targetGroups.addUser")}
            </Button>
          </div>
          {!values.users.length && (
            <p className="text-sm text-[var(--np-muted)]">
              {t("targetGroups.noUsers")}
            </p>
          )}
          {values.users.map((user, index) => (
            <div className={styles.userGrid} key={user._key}>
              {(["email", "firstName", "lastName", "position"] as const).map(
                (field) => {
                  const name = `users.${index}.${field}`;
                  const id = `target-group-user-${user._key}-${field}`;
                  const issue = getIn(touched, name)
                    ? (getIn(errors, name) as string | undefined)
                    : undefined;
                  return (
                    <Field name={name} key={name}>
                      {({
                        field: input,
                      }: {
                        field: Record<string, unknown>;
                      }) => (
                        <FormField
                          id={id}
                          label={t(`targetGroups.${field}`)}
                          error={issue}
                          required={field !== "position"}
                        >
                          {(control) => (
                            <Input
                              {...control}
                              {...input}
                              type={field === "email" ? "email" : "text"}
                              placeholder={
                                field === "position"
                                  ? t("targetGroups.positionPlaceholder")
                                  : undefined
                              }
                            />
                          )}
                        </FormField>
                      )}
                    </Field>
                  );
                },
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeUser(index)}
                aria-label={`${t("targetGroups.removeUser")}: ${user.email || index + 1}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
          ))}
        </section>
      )}
      {error && <FormMessage variant="error">{error}</FormMessage>}
      {success && <FormMessage variant="success">{success}</FormMessage>}
      <div className={styles.buttons}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? t("common.saveChanges") : t("common.create")}
        </Button>
      </div>
    </Form>
  );
}
