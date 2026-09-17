"use client";

import Link from "next/link";
import { useDashboard } from "@/src/hooks/use-dashboard";
import { DashboardPresentation } from "./presentation";
import { DashboardScheduleTimeline } from "./dashboard-schedule-timeline";

export function DashboardContainer() {
  const { activeOrganization, data, isLoading, error } = useDashboard();

  return (
    <DashboardPresentation
      organizationName={activeOrganization?.name}
      data={data}
      isLoading={isLoading}
      error={error?.message}
      timeline={<DashboardScheduleTimeline />}
      linkComponent={Link}
    />
  );
}
