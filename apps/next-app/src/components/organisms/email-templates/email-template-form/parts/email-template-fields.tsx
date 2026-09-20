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
import type { EmailTemplateFormValues } from "../types/email-template-form.types";

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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-[18px] min-[621px]:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)] min-[621px]:[&>:first-child]:col-span-2 min-[621px]:[&>:nth-child(2)]:col-span-2">
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
          <div className="grid items-center gap-2 text-xs text-[var(--np-muted)] min-[621px]:col-span-2 min-[621px]:grid-cols-[auto_auto_auto_1fr] max-[620px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[620px]:[&>span]:col-span-full">
            <Checkbox
              id="trackingPixel"
              checked={values.trackingPixel}
              onCheckedChange={(checked) =>
                setFieldValue("trackingPixel", checked === true)
              }
            />
            <label
              htmlFor="trackingPixel"
              className="text-[13px] font-semibold text-[var(--np-ink)]"
            >
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
