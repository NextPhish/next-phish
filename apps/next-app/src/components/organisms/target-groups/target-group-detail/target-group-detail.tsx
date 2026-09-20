"use client";

import { TargetGroupAddUser } from "../target-group-add-user";
import { TargetGroupForm } from "../target-group-form";
import { TargetGroupImport } from "../target-group-import";
import { useTargetGroupDetail } from "./hooks/use-target-group-detail";
import { TargetGroupDetailView } from "./parts/target-group-detail-view";

export function TargetGroupDetail({ groupId }: { groupId: string }) {
  const model = useTargetGroupDetail(groupId);
  return (
    <>
      <TargetGroupDetailView
        {...model.viewProps}
        form={
          model.group ? (
            <TargetGroupForm
              mode="edit"
              groupId={groupId}
              initialName={model.group.name}
              initialStatus={model.group.status}
              onSuccess={model.invalidate}
            />
          ) : null
        }
      />
      <TargetGroupAddUser
        visible={model.addOpen}
        onHide={model.closeAdd}
        targetGroupId={groupId}
      />
      <TargetGroupImport
        visible={model.importOpen}
        onHide={model.closeImport}
        targetGroupId={groupId}
      />
    </>
  );
}
