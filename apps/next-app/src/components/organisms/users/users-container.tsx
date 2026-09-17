"use client";
import { useEffect, useRef, useState } from "react";
import type { UserView } from "@next-phish/backend";
import { useDataTableState } from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { UsersPresentation } from "./users-presentation";
import { CreateUserContainer } from "./create-user-container";
import { DeleteUserDialog } from "./delete-user-dialog";

export function UsersContainer() {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<UserView | null>(null);
  const [toggling, setToggling] = useState<UserView | null>(null);
  const { status, setError, reset } = useFormStatus();
  useEffect(() => {
    timer.current = setTimeout(() => setSearch(state.search), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.search]);
  const query = trpc.user.list.useQuery({
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: state.sorting
      .filter((item) =>
        ["name", "email", "role", "createdAt"].includes(item.id),
      )
      .map((item) => ({
        field: item.id as "name" | "email" | "role" | "createdAt",
        order: item.desc ? ("desc" as const) : ("asc" as const),
      })),
    filters:
      state.filters.role || state.filters.status
        ? {
            role:
              state.filters.role === "admin" || state.filters.role === "user"
                ? state.filters.role
                : undefined,
            status:
              state.filters.status === "active" ||
              state.filters.status === "pending" ||
              state.filters.status === "disabled"
                ? state.filters.status
                : undefined,
          }
        : undefined,
  });
  const setDisabled = trpc.user.setDisabled.useMutation({
    onSuccess: async () => {
      setToggling(null);
      reset();
      await utils.user.list.invalidate();
    },
    onError: () => setError(t("usersUi.statusError")),
  });
  return (
    <>
      <UsersPresentation
        users={query.data?.users ?? []}
        total={query.data?.total ?? 0}
        loading={query.isLoading}
        error={query.error ? t("usersUi.listError") : undefined}
        onRetry={() => void query.refetch()}
        state={state}
        onStateChange={onStateChange}
        onCreate={() => setCreateOpen(true)}
        onDeleteRequest={setDeleting}
        toggling={toggling}
        onToggleRequest={(user) => {
          reset();
          setToggling(user);
        }}
        onToggleCancel={() => setToggling(null)}
        onToggleConfirm={() => {
          if (toggling)
            setDisabled.mutate({
              userId: toggling.id,
              disabled: !toggling.disabledAt,
            });
        }}
        togglePending={setDisabled.isPending}
        toggleError={status.type === "error" ? status.message : undefined}
      />
      {createOpen && (
        <CreateUserContainer
          visible
          onCreated={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      )}
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
