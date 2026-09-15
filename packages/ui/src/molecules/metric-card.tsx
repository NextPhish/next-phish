import type { ReactNode } from "react";
import { Card } from "./card";
export function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="np-metric">
      <div className="np-metric-label">
        <span>{label}</span>
        <span aria-hidden="true">{icon}</span>
      </div>
      <strong>{value}</strong>
      {detail && <div className="np-metric-detail">{detail}</div>}
    </Card>
  );
}
