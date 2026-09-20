"use client";
import type { ReactNode } from "react";
import { AuthLayout } from "@next-phish/ui";
import { useTranslation } from "../../../../lib/i18n";
export function SetupScreen({
  children,
  signInLink,
}: {
  children: ReactNode;
  signInLink: ReactNode;
}) {
  const t = useTranslation();
  return (
    <AuthLayout
      wide
      badge={t("setup.badge")}
      title={t("setup.title")}
      subtitle={t("setup.subtitle")}
      brandTitle={t("setup.brandTitle")}
      brandDescription={t("setup.brandDescription")}
      brandFooter={t("login.brandFooter")}
      footer={
        <>
          {t("setup.alreadyHaveAccess")} {signInLink}
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}
