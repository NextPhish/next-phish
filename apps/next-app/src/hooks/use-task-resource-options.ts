"use client";

import type { TaskResourceType } from "@next-phish/shared";
import { trpc } from "@/src/lib/trpc";

interface ResourceOption {
  id: string;
  name: string;
}

export function useTaskResourceOptions(
  type: TaskResourceType | undefined,
  selectedId: string | undefined,
  search: string,
) {
  const queryInput = { search: search || undefined, limit: 20, offset: 0 };
  const campaign = trpc.campaign.list.useQuery(queryInput, {
    enabled: type === "CAMPAIGN",
  });
  const schedule = trpc.campaign.listSchedules.useQuery(queryInput, {
    enabled: type === "SCHEDULE",
  });
  const page = trpc.page.list.useQuery(
    {
      ...queryInput,
      selectedId: type === "PAGE" ? selectedId : undefined,
      includeContent: false,
    },
    { enabled: type === "PAGE" },
  );
  const emailTemplate = trpc.emailTemplate.list.useQuery(
    {
      ...queryInput,
      selectedId: type === "EMAIL_TEMPLATE" ? selectedId : undefined,
      includeContent: false,
    },
    { enabled: type === "EMAIL_TEMPLATE" },
  );
  const targetGroup = trpc.targetGroup.list.useQuery(queryInput, {
    enabled: type === "TARGET_GROUP",
  });
  const sendingProfile = trpc.mailSending.list.useQuery(queryInput, {
    enabled: type === "SENDING_PROFILE",
  });

  const byType: Partial<Record<TaskResourceType, ResourceOption[]>> = {
    CAMPAIGN: campaign.data?.rows ?? [],
    SCHEDULE: schedule.data?.rows ?? [],
    PAGE: page.data?.pages ?? [],
    EMAIL_TEMPLATE: emailTemplate.data?.emailTemplates ?? [],
    TARGET_GROUP: targetGroup.data?.targetGroups ?? [],
    SENDING_PROFILE: sendingProfile.data?.profiles ?? [],
  };
  const queries = {
    CAMPAIGN: campaign,
    SCHEDULE: schedule,
    PAGE: page,
    EMAIL_TEMPLATE: emailTemplate,
    TARGET_GROUP: targetGroup,
    SENDING_PROFILE: sendingProfile,
  };
  const activeQuery = type ? queries[type] : undefined;
  const loading = activeQuery?.isLoading ?? false;
  const options = type ? (byType[type] ?? []) : [];
  return { options, loading, error: activeQuery?.error };
}
