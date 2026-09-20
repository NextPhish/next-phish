"use client";

import Link from "next/link";
import { useDashboard } from "./hooks/use-dashboard";
import { DashboardView } from "./parts/dashboard-view";
import { DashboardScheduleTimeline } from "./parts/dashboard-schedule-timeline";

export function Dashboard() {
  const { activeOrganization, data, isLoading, error } = useDashboard();

  return (
    <DashboardView
      organizationName={activeOrganization?.name}
      data={data}
      isLoading={isLoading}
      error={error?.message}
      timeline={<DashboardScheduleTimeline />}
      linkComponent={Link}
    />
  );
}
