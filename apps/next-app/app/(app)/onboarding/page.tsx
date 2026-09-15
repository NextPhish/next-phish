import { OnboardingContainer } from "@/src/components/organisms/onboarding";
import { OnboardingScreen } from "@/src/components/organisms/onboarding/screen";
export const dynamic = "force-dynamic";
export default function OnboardingPage() {
  return (
    <OnboardingScreen>
      <OnboardingContainer />
    </OnboardingScreen>
  );
}
