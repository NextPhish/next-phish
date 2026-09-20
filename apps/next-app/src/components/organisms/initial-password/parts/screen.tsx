"use client";

import type { ReactNode } from "react";
import { AuthLayout } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";

export function InitialPasswordScreen({ children }: { children: ReactNode }) {
  const t = useTranslation();
  return (
    <AuthLayout
      badge={t("initialPassword.badge")}
      title={t("initialPassword.title")}
      subtitle={t("initialPassword.subtitle")}
      brandTitle={t("initialPassword.brandTitle")}
      brandDescription={t("initialPassword.brandDescription")}
      brandFooter={t("login.brandFooter")}
    >
      {children}
    </AuthLayout>
  );
}
