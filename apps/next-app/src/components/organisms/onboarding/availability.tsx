"use client";
import { useFormikContext } from "formik";
import { useSlugAvailability } from "@/src/hooks/use-slug-availability";
import { OnboardingPresentation, type OnboardingValues } from "./presentation";
export function OnboardingAvailability({ error }: { error: string }) {
  const { values } = useFormikContext<OnboardingValues>();
  const slugStatus = useSlugAvailability(values.slug);
  return <OnboardingPresentation error={error} slugStatus={slugStatus} />;
}
