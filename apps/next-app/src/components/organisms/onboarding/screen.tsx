"use client";
import type { ReactNode } from "react";
import { AuthLayout } from "@next-phish/ui";
import { useTranslation } from "../../../lib/i18n";
export function OnboardingScreen({ children }: { children: ReactNode }) {
  const t = useTranslation();
  return (
    <AuthLayout
      wide
      badge={t("onboarding.badge")}
      title={t("onboarding.title")}
      subtitle={t("onboarding.subtitle")}
      brandTitle={t("onboarding.brandTitle")}
      brandDescription={t("onboarding.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      {children}
    </AuthLayout>
  );
}
