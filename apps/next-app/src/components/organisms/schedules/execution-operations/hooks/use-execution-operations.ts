"use client";

import { trpc } from "@/src/lib/trpc";

export function useExecutionOperations() {
  return trpc.campaign.executionOperations.useQuery(undefined, {
    refetchInterval: 10000,
  });
}

export type ExecutionOperationsModel = ReturnType<
  typeof useExecutionOperations
>;
