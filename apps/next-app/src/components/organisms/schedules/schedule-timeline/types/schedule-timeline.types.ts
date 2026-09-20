export interface ScheduleTimelineProps {
  variant?: "legacy" | "v1";
  locale?: string;
  labels?: {
    title: string;
    description: string;
    range: string;
    schedules: string;
    campaigns: string;
    empty: string;
    error: string;
  };
}
