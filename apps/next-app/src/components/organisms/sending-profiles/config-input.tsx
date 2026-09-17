"use client";
import { getIn, useFormikContext } from "formik";
import { FormField, Input, PasswordInput } from "@next-phish/ui";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n";

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}
export function ConfigInput({
  name,
  label,
  placeholder,
  secret,
  type,
  autoComplete,
  required,
}: Props) {
  const t = useTranslation();
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<SendingProfileFormValues>();
  const value = getIn(values, name) ?? "";
  const error = getIn(touched, name) ? getIn(errors, name) : undefined;
  const id = `sending-${name.replaceAll(".", "-")}`;
  return (
    <FormField
      id={id}
      label={label}
      error={typeof error === "string" ? error : undefined}
      required={required}
    >
      {(control) =>
        secret ? (
          <PasswordInput
            {...control}
            value={value}
            autoComplete={autoComplete ?? "off"}
            showLabel={t("sendingProfiles.showSecret")}
            hideLabel={t("sendingProfiles.hideSecret")}
            placeholder={placeholder}
            onChange={(event) => setFieldValue(name, event.target.value)}
            onBlur={() => setFieldTouched(name, true)}
          />
        ) : (
          <Input
            {...control}
            type={type ?? "text"}
            value={value}
            autoComplete={autoComplete}
            placeholder={placeholder}
            onChange={(event) => setFieldValue(name, event.target.value)}
            onBlur={() => setFieldTouched(name, true)}
          />
        )
      }
    </FormField>
  );
}
