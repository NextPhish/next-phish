"use client";

import { useFormikContext } from "formik";
import { useSlugAvailability } from "@/src/hooks/use-slug-availability";
import {
  OnboardingView,
  type OnboardingValues,
} from "@/src/components/organisms/onboarding";

export function CreateOrganizationForm({
  error,
  onCancel,
}: {
  error: string;
  onCancel: () => void;
}) {
  const { values } = useFormikContext<OnboardingValues>();
  const slugStatus = useSlugAvailability(values.slug);
  return (
    <OnboardingView error={error} slugStatus={slugStatus} onCancel={onCancel} />
  );
}
