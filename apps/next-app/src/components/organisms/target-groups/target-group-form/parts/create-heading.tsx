"use client";
import { PageHeader } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
export function TargetGroupCreateHeading() {
  const t = useTranslation();
  return (
    <PageHeader
      title={t("targetGroups.createTitle")}
      description={t("targetGroups.createSubtitle")}
    />
  );
}
