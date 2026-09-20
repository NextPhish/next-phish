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
import type { TargetGroupFormValues } from "../types/form-values";
interface Props {
  error: string;
  success: string;
  isEdit: boolean;
  onCancel?: () => void;
}
export function TargetGroupFormFields({
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
                { value: "ACTIVE", label: t("targetGroups.active") },
                { value: "ARCHIVED", label: t("targetGroups.archived") },
              ]}
              onValueChange={(value) => void setFieldValue("status", value)}
            />
          )}
        </FormField>
      </div>
      {!isEdit && (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{t("targetGroups.users")}</h2>
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
            <div
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-subtle)] p-4"
              key={user._key}
            >
              <div className="grid min-w-0 grid-cols-1 gap-3 min-[541px]:grid-cols-2 min-[801px]:grid-cols-4">
                {(["email", "firstName", "lastName", "position"] as const).map(
                  (field) => {
                    const name = `users.${index}.${field}`;
                    const id = `target-group-user-${user._key}-${field}`;
                    const issue = getIn(touched, name)
                      ? (getIn(errors, name) as string | undefined)
                      : undefined;
                    return (
                      <Field name={name} key={field}>
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
              </div>
              <Button
                className="mt-7"
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
      <div className="flex flex-wrap gap-3">
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
