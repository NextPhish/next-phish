"use client";

import { ScheduleFormDetails } from "./schedule-form-details";
import { ScheduleFormRecurrence } from "./schedule-form-recurrence";
import { ScheduleFormDelivery } from "./schedule-form-delivery";
import { ScheduleFormCompletion } from "./schedule-form-completion";

interface Props {
  campaigns: Array<{ id: string; name: string; type: "TEMPLATE" | "CONCRETE" }>;
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
}

export function ScheduleFormSections({ campaigns, targetGroups }: Props) {
  return (
    <>
      <ScheduleFormDetails campaigns={campaigns} targetGroups={targetGroups} />
      <ScheduleFormRecurrence />
      <ScheduleFormDelivery />
      <ScheduleFormCompletion />
    </>
  );
}
