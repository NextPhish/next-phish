"use client";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailTemplateListItemView } from "@next-phish/shared";
import { useDataTableState } from "@next-phish/ui";
import { useLocale, useTranslation } from "@/src/lib/i18n";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import { EmailTemplatesPresentation } from "./email-templates-presentation";

type Confirmation =
  | { type: "closed" }
  | { type: "delete"; template: EmailTemplateListItemView };

export function EmailTemplatesOverview() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslation();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const [confirmation, setConfirmation] = useReducer(
    (_: Confirmation, next: Confirmation) => next,
    { type: "closed" },
  );
  const { status: mutationStatus, setError, reset } = useFormStatus();
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(state.search), 300);
    return () => clearTimeout(timeout);
  }, [state.search]);
  const allowedSorts = new Set(["name", "status", "createdAt", "updatedAt"]);
  const sort = state.sorting.flatMap(({ id, desc }) =>
    allowedSorts.has(id)
      ? [
          {
            field: id as "name" | "status" | "createdAt" | "updatedAt",
            order: desc ? ("desc" as const) : ("asc" as const),
          },
        ]
      : [],
  );
  const status = state.filters.status;
  const statusFilter: "ACTIVE" | "DRAFT" | undefined =
    status === "ACTIVE" || status === "DRAFT" ? status : undefined;
  const queryInput = {
    search: debouncedSearch || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: sort.length ? sort : undefined,
    filters: statusFilter ? { status: statusFilter } : undefined,
  };
  const { data, isLoading, error, refetch } =
    trpc.emailTemplate.list.useQuery(queryInput);
  const remove = trpc.emailTemplate.delete.useMutation({
    onSuccess: async () => {
      setConfirmation({ type: "closed" });
      reset();
      await utils.emailTemplate.list.invalidate();
    },
    onError: () => setError(t("emailTemplates.deleteError")),
  });
  const deleteTarget =
    confirmation.type === "delete" ? confirmation.template : null;
  return (
    <EmailTemplatesPresentation
      t={t}
      locale={locale}
      rows={data?.emailTemplates ?? []}
      total={data?.total ?? 0}
      state={state}
      onStateChange={onStateChange}
      loading={isLoading}
      error={error ? t("tableUi.error") : undefined}
      onRetry={() => void refetch()}
      deleteTarget={deleteTarget}
      deleting={remove.isPending}
      deleteError={
        mutationStatus.type === "error" ? mutationStatus.message : ""
      }
      onCreate={() => router.push("/email-templates/new")}
      onEdit={(id) => router.push(`/email-templates/${id}`)}
      onAskDelete={(template) => {
        reset();
        setConfirmation({ type: "delete", template });
      }}
      onCancelDelete={() => {
        if (!remove.isPending) {
          setConfirmation({ type: "closed" });
          reset();
        }
      }}
      onDelete={() => {
        if (deleteTarget && !remove.isPending)
          remove.mutate({ id: deleteTarget.id });
      }}
    />
  );
}
