"use client";

import { Field, Form, useFormikContext } from "formik";
import type { OrganizationCreateMemberInput } from "@next-phish/shared";
import {
  Button,
  Dialog,
  FormErrorSummary,
  FormField,
  FormMessage,
  Input,
} from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";

export function AddMemberFields({
  error,
  welcomeWarning,
  retrying,
  onRetryWelcome,
  onCancel,
  needsName,
}: {
  error: string;
  welcomeWarning: string;
  retrying: boolean;
  onRetryWelcome: () => void;
  onCancel: () => void;
  needsName: boolean;
}) {
  const t = useTranslation();
  const { errors, touched, isSubmitting } =
    useFormikContext<OrganizationCreateMemberInput>();
  const summary = Object.entries(errors).flatMap(([field, message]) =>
    typeof message === "string" ? [{ id: `add-member-${field}`, message }] : [],
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !isSubmitting && onCancel()}
      title={t("organizations.addMember")}
      description={t("organizations.addMemberHint")}
      closeLabel={t("common.close")}
      dismissible={!isSubmitting}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          {welcomeWarning ? (
            <Button type="button" loading={retrying} onClick={onRetryWelcome}>
              {t("organizations.retryWelcome")}
            </Button>
          ) : (
            <Button type="submit" form="add-member-form" loading={isSubmitting}>
              {needsName ? t("organizations.addAndSend") : t("common.continue")}
            </Button>
          )}
        </div>
      }
    >
      <Form id="add-member-form" className="grid gap-5" noValidate>
        <FormErrorSummary errors={summary} title={t("usersUi.correctErrors")} />
        {([...(needsName ? (["name"] as const) : []), "email"] as const).map(
          (name) => (
            <FormField
              key={name}
              id={`add-member-${name}`}
              label={t(name === "name" ? "organizations.name" : "common.email")}
              error={touched[name] ? errors[name] : undefined}
              required
            >
              {(control) => (
                <Field
                  as={Input}
                  {...control}
                  name={name}
                  type={name === "email" ? "email" : "text"}
                  autoComplete="off"
                  disabled={isSubmitting || Boolean(welcomeWarning)}
                />
              )}
            </FormField>
          ),
        )}
        {error && <FormMessage variant="error">{error}</FormMessage>}
        {welcomeWarning && (
          <FormMessage variant="info">{welcomeWarning}</FormMessage>
        )}
      </Form>
    </Dialog>
  );
}
