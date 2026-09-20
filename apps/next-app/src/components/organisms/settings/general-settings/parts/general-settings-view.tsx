"use client";

import { Field, Form, useFormikContext, type FieldInputProps } from "formik";
import {
  Autocomplete,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  FormMessage,
  Input,
  Select,
} from "@next-phish/ui";
import { SUPPORTED_LANGUAGES } from "../../../../../lib/constants";
import { useTranslation } from "../../../../../lib/i18n";

export interface GeneralValues {
  name: string;
  timezone: string;
  language: string;
}

interface GeneralSettingsViewProps {
  email: string;
  timezones: string[];
  error: string;
  success: string;
}

export function GeneralSettingsView({
  email,
  timezones,
  error,
  success,
}: GeneralSettingsViewProps) {
  const t = useTranslation();
  const {
    errors,
    touched,
    isSubmitting,
    setFieldTouched,
    setFieldValue,
    values,
  } = useFormikContext<GeneralValues>();

  return (
    <Card>
      <CardHeader
        title={t("settings.profileDetailsTitle")}
        description={t("settings.profileDetailsHint")}
      />
      <CardBody>
        <Form
          noValidate
          className="grid gap-5"
          aria-busy={isSubmitting || undefined}
        >
          <div className="grid grid-cols-1 gap-5 min-[701px]:grid-cols-2">
            <FormField
              id="profile-name"
              label={t("common.name")}
              hint={t("settings.nameHint")}
              error={touched.name ? errors.name : undefined}
              required
            >
              {(control) => (
                <Field name="name">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <Input
                      {...control}
                      {...field}
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                  )}
                </Field>
              )}
            </FormField>
            <FormField
              id="profile-email"
              label={t("common.email")}
              hint={t("settings.emailReadonly")}
            >
              {(control) => (
                <Input
                  {...control}
                  value={email}
                  type="email"
                  autoComplete="email"
                  disabled
                  readOnly
                />
              )}
            </FormField>
            <FormField
              id="profile-timezone"
              label={t("settings.timezone")}
              hint={t("settings.timezoneHint")}
              error={touched.timezone ? errors.timezone : undefined}
              required
            >
              {(control) => (
                <Autocomplete
                  {...control}
                  name="timezone"
                  options={timezones.map((timezone) => ({
                    value: timezone,
                    label: timezone.replaceAll("_", " "),
                  }))}
                  value={values.timezone}
                  onValueChange={(value) => setFieldValue("timezone", value)}
                  onBlur={() => setFieldTouched("timezone", true)}
                  disabled={isSubmitting}
                  placeholder={t("settings.selectTimezone")}
                  emptyLabel={t("settings.noTimezones")}
                  listLabel={t("settings.timezoneListLabel")}
                />
              )}
            </FormField>
            <FormField
              id="profile-language"
              label={t("settings.language")}
              hint={t("settings.languageHint")}
              error={touched.language ? errors.language : undefined}
              required
            >
              {(control) => (
                <Select
                  {...control}
                  options={SUPPORTED_LANGUAGES}
                  value={values.language}
                  onValueChange={(value) => setFieldValue("language", value)}
                  onBlur={() => setFieldTouched("language", true)}
                  disabled={isSubmitting}
                  placeholder={t("settings.selectLanguage")}
                />
              )}
            </FormField>
          </div>
          {error && <FormMessage variant="error">{error}</FormMessage>}
          {success && <FormMessage variant="success">{success}</FormMessage>}
          <div className="flex justify-end gap-2.5">
            <Button type="submit" loading={isSubmitting}>
              {t("common.saveChanges")}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
