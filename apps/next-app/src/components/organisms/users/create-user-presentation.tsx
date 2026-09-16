"use client";
import { Field, Form, useFormikContext } from "formik";
import type { AdminCreateUserInput } from "@next-phish/shared";
import {
  Button,
  Dialog,
  FormErrorSummary,
  FormField,
  FormMessage,
  Input,
  Select,
  Skeleton,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
import styles from "./users.module.css";
interface Props {
  visible: boolean;
  organizations: Array<{ id: string; name: string }>;
  organizationsLoading: boolean;
  error: string;
  onCancel: () => void;
}
export function CreateUserPresentation({
  visible,
  organizations,
  organizationsLoading,
  error,
  onCancel,
}: Props) {
  const t = useTranslation();
  const { values, errors, touched, setFieldValue, isSubmitting } =
    useFormikContext<AdminCreateUserInput>();
  const summary = Object.entries(errors)
    .filter(([, message]) => typeof message === "string")
    .map(([field, message]) => ({
      id: `create-user-${field}`,
      message: String(message),
    }));
  const footer = (
    <div className={styles.footer}>
      <Button
        type="button"
        variant="secondary"
        disabled={isSubmitting}
        onClick={onCancel}
      >
        {t("common.cancel")}
      </Button>
      <Button type="submit" form="create-user-form" loading={isSubmitting}>
        {t("usersUi.createAndSend")}
      </Button>
    </div>
  );
  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onCancel();
      }}
      title={t("usersUi.createUser")}
      description={t("usersUi.welcomeHint")}
      closeLabel={t("common.close")}
      dismissible={!isSubmitting}
      footer={footer}
    >
      <Form id="create-user-form" className={styles.form} noValidate>
        <FormErrorSummary errors={summary} title={t("usersUi.correctErrors")} />
        <div className={styles.formGrid}>
          {(["name", "email"] as const).map((name) => (
            <Field name={name} key={name}>
              {({ field }: { field: Record<string, unknown> }) => (
                <FormField
                  id={`create-user-${name}`}
                  label={t(`usersUi.${name}`)}
                  error={touched[name] ? errors[name] : undefined}
                  required
                >
                  {(control) => (
                    <Input
                      {...control}
                      {...field}
                      type={name === "email" ? "email" : "text"}
                      autoComplete="off"
                    />
                  )}
                </FormField>
              )}
            </Field>
          ))}
        </div>
        <FormField id="create-user-role" label={t("usersUi.systemRole")}>
          {(control) => (
            <Select
              {...control}
              value={values.role}
              options={[
                { value: "user", label: t("usersUi.member") },
                { value: "admin", label: t("usersUi.administrator") },
              ]}
              onValueChange={(value) => void setFieldValue("role", value)}
            />
          )}
        </FormField>
        <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0">
          <legend className="mb-2 text-sm font-semibold">
            {t("usersUi.organizationAccess")}
          </legend>
          <label className={styles.option}>
            <input
              type="radio"
              className="accent-[var(--np-primary)]"
              name="organizationMode"
              checked={values.organizationMode === "self"}
              disabled={isSubmitting}
              onChange={() => {
                void setFieldValue("organizationMode", "self");
                void setFieldValue("organizationId", undefined);
              }}
            />
            <span>
              <strong>{t("usersUi.createOwn")}</strong>
              {t("usersUi.createOwnHint")}
            </span>
          </label>
          <label className={styles.option}>
            <input
              type="radio"
              className="accent-[var(--np-primary)]"
              name="organizationMode"
              checked={values.organizationMode === "existing"}
              disabled={isSubmitting}
              onChange={() =>
                void setFieldValue("organizationMode", "existing")
              }
            />
            <span>
              <strong>{t("usersUi.assignOrganization")}</strong>
              {t("usersUi.assignOrganizationHint")}
            </span>
          </label>
          {values.organizationMode === "existing" &&
            (organizationsLoading ? (
              <Skeleton style={{ height: "2.75rem", width: "100%" }} />
            ) : (
              <FormField
                id="create-user-organizationId"
                label={t("usersUi.organizations")}
                error={
                  touched.organizationId ? errors.organizationId : undefined
                }
              >
                {(control) => (
                  <Select
                    {...control}
                    value={values.organizationId || undefined}
                    options={organizations.map((org) => ({
                      value: org.id,
                      label: org.name,
                    }))}
                    onValueChange={(value) =>
                      void setFieldValue("organizationId", value)
                    }
                    placeholder={t("usersUi.selectOrganization")}
                  />
                )}
              </FormField>
            ))}
        </fieldset>
        {error && <FormMessage variant="error">{error}</FormMessage>}
      </Form>
    </Dialog>
  );
}
