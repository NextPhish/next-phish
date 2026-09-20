export type ScheduleRow = {
  id: string;
  name: string;
  type: "ONE_TIME" | "RECURRING";
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  startsAt: Date;
  targetTimezone: string;
  frequency: string | null;
  targetGroup: { name: string; _count: { users: number } } | null;
  sources: Array<{ campaign: { name: string } }>;
  _count: { campaigns: number };
};
