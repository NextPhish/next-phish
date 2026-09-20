"use client";

import { DashboardSkeleton } from "@/src/components/organisms/dashboard";
import { useTranslation } from "@/src/lib/i18n";

export default function DashboardLoading() {
  const t = useTranslation();
  return <DashboardSkeleton label={t("common.loading")} />;
}
