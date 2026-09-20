import {
  Onboarding,
  OnboardingScreen,
} from "@/src/components/organisms/onboarding";
export const dynamic = "force-dynamic";
export default function OnboardingPage() {
  return (
    <OnboardingScreen>
      <Onboarding />
    </OnboardingScreen>
  );
}
