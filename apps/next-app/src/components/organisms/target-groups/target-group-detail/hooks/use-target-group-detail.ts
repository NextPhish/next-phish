"use client";

import { useEffect, useRef, useState } from "react";
import { useDataTableState } from "@next-phish/ui";
import type { TargetGroupUserView } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";

export function useTargetGroupDetail(groupId: string) {
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

  return {
    group: group.data ?? null,
    viewProps: {
      group: group.data ?? null,
      groupLoading: group.isLoading,
      groupId,
      users: users.data?.users ?? [],
      total: users.data?.total ?? 0,
      usersLoading: users.isLoading,
      usersError: users.error ? t("targetGroups.usersError") : undefined,
      onRetryUsers: () => void users.refetch(),
      state,
      onStateChange,
      onAdd: () => setAddOpen(true),
      onImport: () => setImportOpen(true),
      removing,
      removePending: remove.isPending,
      removeError: status.type === "error" ? status.message : undefined,
      onRemoveRequest: (user: TargetGroupUserView) => {
        reset();
        setRemoving(user);
      },
      onRemoveCancel: () => setRemoving(null),
      onRemoveConfirm: () => {
        if (removing)
          remove.mutate({ id: removing.id, targetGroupId: groupId });
      },
    },
    addOpen,
    closeAdd: () => setAddOpen(false),
    importOpen,
    closeImport: () => setImportOpen(false),
    invalidate: () => void utils.targetGroup.invalidate(),
  };
}
