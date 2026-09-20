"use client";
import { useFormikContext } from "formik";
import { useSlugAvailability } from "@/src/hooks/use-slug-availability";
import { OnboardingView, type OnboardingValues } from "./parts/onboarding-view";
export function OnboardingAvailability({ error }: { error: string }) {
  const { values } = useFormikContext<OnboardingValues>();
  const slugStatus = useSlugAvailability(values.slug);
  return <OnboardingView error={error} slugStatus={slugStatus} />;
}
