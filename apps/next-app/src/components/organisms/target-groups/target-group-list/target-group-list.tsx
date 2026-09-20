"use client";

import { useTargetGroupList } from "./hooks/use-target-group-list";
import { TargetGroupListView } from "./parts/target-group-list-view";

export function TargetGroupList() {
  return <TargetGroupListView {...useTargetGroupList()} />;
}
