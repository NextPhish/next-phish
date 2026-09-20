"use client";

import { useRouter } from "next/navigation";
import { Formik } from "formik";
import { authClient } from "@/src/lib/auth-client";
import { createOrganizationSchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import { OnboardingAvailability } from "./availability";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

interface OnboardingValues {
  name: string;
  slug: string;
}

export function Onboarding() {
  const t = useTranslation();
  const router = useRouter();
  const { status, setError, reset } = useFormStatus();

  async function handleSubmit(values: OnboardingValues) {
    reset();
    try {
      const { error: err } = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
      });

      if (err) {
        setError(
          err.message || err.code || t("onboarding.failedToCreateOrganization"),
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(t("onboarding.failedToCreateOrganization"));
    }
  }

  return (
    <Formik<OnboardingValues>
      initialValues={{ name: "", slug: "" }}
      validate={toFormikValidation(createOrganizationSchema)}
      onSubmit={handleSubmit}
    >
      <OnboardingAvailability
        error={status.type === "error" ? status.message : ""}
      />
    </Formik>
  );
}
