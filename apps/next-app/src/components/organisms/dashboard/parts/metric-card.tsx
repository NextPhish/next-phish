import type { ReactNode } from "react";
import { MetricCard as UiMetricCard } from "@next-phish/ui";

interface DashboardMetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

export function DashboardMetricCard({
  label,
  value,
  detail,
  icon,
}: DashboardMetricCardProps) {
  return (
    <UiMetricCard
      label={label}
      value={value}
      detail={detail}
      icon={<span className="text-ui-primary">{icon}</span>}
    />
  );
}
