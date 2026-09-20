"use client";

import { useExecutionOperations } from "./hooks/use-execution-operations";
import { ExecutionOperationsView } from "./parts/execution-operations-view";

export function ExecutionOperations() {
  return <ExecutionOperationsView operations={useExecutionOperations()} />;
}
