import { Field, Form, useFormikContext } from "formik";
import { Button, FormField, Input } from "@next-phish/ui";
import { Plus } from "lucide-react";
import type { IgnoredNetworkInput } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n";

export function IgnoredNetworkForm() {
  const t = useTranslation();
  const { isSubmitting, errors, touched } =
    useFormikContext<IgnoredNetworkInput>();

  return (
    <Form
      className="mb-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-4 [&_.np-input]:h-[43px] max-[760px]:grid-cols-1"
      noValidate
    >
      <FormField
        id="ignored-network"
        label={t("organizations.ipOrNetwork")}
        required
        error={touched.network ? errors.network : undefined}
      >
        {(control) => (
          <Field
            as={Input}
            name="network"
            placeholder="192.0.2.10 or 10.0.0.0/8"
            {...control}
          />
        )}
      </FormField>
      <FormField
        id="ignored-network-description"
        label={t("organizations.description")}
        error={touched.description ? errors.description : undefined}
      >
        {(control) => (
          <Field
            as={Input}
            name="description"
            placeholder={t("organizations.descriptionPlaceholder")}
            {...control}
          />
        )}
      </FormField>
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="mt-[27px] h-[43px] whitespace-nowrap max-[760px]:mt-0 max-[760px]:w-fit"
      >
        <Plus size={16} aria-hidden="true" />
        {t("organizations.addIgnoredNetwork")}
      </Button>
    </Form>
  );
}
