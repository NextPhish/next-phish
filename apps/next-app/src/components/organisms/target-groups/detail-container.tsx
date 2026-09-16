"use client";
import { useEffect, useRef, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import type { TargetGroupUserView } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { TargetGroupDetailPresentation } from "./detail-presentation";
import { AddUserDialog } from "./add-user-dialog";
import { ImportUsersDialog } from "./import-users-dialog";
import { TargetGroupForm } from "./target-group-form";

export function TargetGroupDetailContainer({ groupId }: { groupId: string }) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [removing, setRemoving] = useState<TargetGroupUserView | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { status, setError, reset } = useFormStatus();
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(state.search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.search]);
  const group = trpc.targetGroup.getById.useQuery({ id: groupId });
  const users = trpc.targetGroup.getUsers.useQuery({
    targetGroupId: groupId,
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
  });
  const remove = trpc.targetGroup.removeUser.useMutation({
    onSuccess: async () => {
      setRemoving(null);
      reset();
      await utils.targetGroup.invalidate();
    },
    onError: () => setError(t("targetGroups.removeUserError")),
  });
  return (
    <>
      <TargetGroupDetailPresentation
        group={group.data ?? null}
        groupLoading={group.isLoading}
        groupId={groupId}
        users={users.data?.users ?? []}
        total={users.data?.total ?? 0}
        usersLoading={users.isLoading}
        usersError={users.error ? t("targetGroups.usersError") : undefined}
        onRetryUsers={() => void users.refetch()}
        state={state}
        onStateChange={onStateChange}
        onAdd={() => setAddOpen(true)}
        onImport={() => setImportOpen(true)}
        removing={removing}
        removePending={remove.isPending}
        removeError={status.type === "error" ? status.message : undefined}
        onRemoveRequest={(user) => {
          reset();
          setRemoving(user);
        }}
        onRemoveCancel={() => setRemoving(null)}
        onRemoveConfirm={() => {
          if (removing)
            remove.mutate({ id: removing.id, targetGroupId: groupId });
        }}
        form={
          group.data ? (
            <TargetGroupForm
              mode="edit"
              groupId={groupId}
              initialName={group.data.name}
              initialStatus={group.data.status}
              onSuccess={() => void utils.targetGroup.invalidate()}
            />
          ) : null
        }
      />
      <AddUserDialog
        visible={addOpen}
        onHide={() => setAddOpen(false)}
        targetGroupId={groupId}
      />
      <ImportUsersDialog
        visible={importOpen}
        onHide={() => setImportOpen(false)}
        targetGroupId={groupId}
      />
    </>
  );
}
