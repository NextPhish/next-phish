"use client";
import { useFormikContext } from "formik";
import {
  Card,
  CardBody,
  Checkbox,
  FormErrorSummary,
  FormField,
  HelpPopover,
  Input,
  Select,
  TagInput,
} from "@next-phish/ui";
import type { TranslationFunction } from "@/src/lib/i18n/shared";
import type { EmailTemplateFormValues } from "./email-template-form";
import styles from "./email-template-form.module.css";

export function EmailTemplateErrorSummary({ t }: { t: TranslationFunction }) {
  const { errors, submitCount } = useFormikContext<EmailTemplateFormValues>();
  const summaryErrors =
    submitCount > 0
      ? [
          typeof errors.name === "string"
            ? { id: "email-template-name", message: errors.name }
            : null,
          typeof errors.tags === "string"
            ? { id: "email-template-tags", message: errors.tags }
            : null,
          typeof errors.status === "string"
            ? { id: "email-template-status", message: errors.status }
            : null,
        ].filter((item): item is { id: string; message: string } =>
          Boolean(item),
        )
      : [];
  return (
    <FormErrorSummary
      title={t("emailTemplates.validationSummary")}
      errors={summaryErrors}
    />
  );
}

export function EmailTemplateFields({ t }: { t: TranslationFunction }) {
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    useFormikContext<EmailTemplateFormValues>();
  return (
    <Card>
      <CardBody>
        <div className={styles.fields}>
          <FormField
            id="email-template-name"
            label={t("emailTemplates.name")}
            required
            error={touched.name ? errors.name : undefined}
          >
            {(control) => (
              <Input
                {...control}
                name="name"
                value={values.name}
                placeholder={t("emailTemplates.namePlaceholder")}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            )}
          </FormField>
          <FormField
            id="email-template-tags"
            label={t("emailTemplates.tags")}
            error={
              touched.tags && typeof errors.tags === "string"
                ? errors.tags
                : undefined
            }
          >
            {(control) => (
              <TagInput
                {...control}
                value={values.tags}
                onValueChange={(next) => setFieldValue("tags", next, true)}
                placeholder={t("emailTemplates.tagsPlaceholder")}
                aria-label={t("emailTemplates.addTag")}
                labels={{
                  tags: t("emailTemplates.selectedTags"),
                  remove: (tag) => t("emailTemplates.removeTag", { tag }),
                }}
              />
            )}
          </FormField>
          <FormField
            id="email-template-status"
            label={t("emailTemplates.status")}
            required
          >
            {(control) => (
              <Select
                {...control}
                value={values.status}
                options={[
                  { value: "DRAFT", label: t("common.draft") },
                  { value: "ACTIVE", label: t("common.active") },
                ]}
                onValueChange={(next) => setFieldValue("status", next)}
              />
            )}
          </FormField>
          <div className={styles.checkField}>
            <Checkbox
              id="trackingPixel"
              checked={values.trackingPixel}
              onCheckedChange={(checked) =>
                setFieldValue("trackingPixel", checked === true)
              }
            />
            <label htmlFor="trackingPixel">
              {t("emailTemplates.trackingPixel")}
            </label>
            <HelpPopover label={t("emailTemplates.trackingPixelHelp")}>
              <p>{t("emailTemplates.trackingPixelHint")}</p>
            </HelpPopover>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
