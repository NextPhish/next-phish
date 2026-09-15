"use client";

import { useFormikContext } from "formik";
import { useSlugAvailability } from "@/src/hooks/use-slug-availability";
import {
  OnboardingPresentation,
  type OnboardingValues,
} from "../onboarding/presentation";

export function CreateOrgForm({
  error,
  onCancel,
}: {
  error: string;
  onCancel: () => void;
}) {
  const { values } = useFormikContext<OnboardingValues>();
  const slugStatus = useSlugAvailability(values.slug);
  return (
    <OnboardingPresentation
      error={error}
      slugStatus={slugStatus}
      onCancel={onCancel}
    />
  );
}
