"use client";

import { useScheduleTable } from "./hooks/use-schedule-table";
import { ScheduleTableView } from "./parts/schedule-table-view";

export function ScheduleTable({ onChanged }: { onChanged: () => void }) {
  return <ScheduleTableView model={useScheduleTable(onChanged)} />;
}
