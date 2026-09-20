"use client";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { useDataTableState } from "@next-phish/ui";
import type { MailSendingProfileView } from "@next-phish/backend";
import { useLocale, useTranslation } from "@/src/lib/i18n";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { trpc } from "@/src/lib/trpc";
import type { SendingProfileListModel } from "../types/sending-profile-list.types";

type Confirmation =
  | { type: "closed" }
  | { type: "delete"; profile: MailSendingProfileView };
const sorts = new Set(["name", "providerType", "createdAt", "updatedAt"]);
const providers = new Set([
  "SMTP",
  "MICROSOFT_GRAPH",
  "AWS_SES",
  "SENDGRID",
  "MAILGUN",
  "POSTMARK",
  "RESEND",
  "GENERAL_API",
]);
export function useSendingProfileList(): SendingProfileListModel {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { state, onStateChange } = useDataTableState();
  const [search, setSearch] = useState(state.search);
  const [confirmation, setConfirmation] = useReducer(
    (_: Confirmation, next: Confirmation) => next,
    { type: "closed" },
  );
  const { status, setError, reset } = useFormStatus();
  useEffect(() => {
    const timer = setTimeout(() => setSearch(state.search), 300);
    return () => clearTimeout(timer);
  }, [state.search]);
  const providerType = state.filters.providerType;
  const queryInput = {
    search: search || undefined,
    limit: state.pagination.pageSize,
    offset: state.pagination.pageIndex * state.pagination.pageSize,
    sort: state.sorting.flatMap(({ id, desc }) =>
      sorts.has(id)
        ? [
            {
              field: id as "name" | "providerType" | "createdAt" | "updatedAt",
              order: desc ? ("desc" as const) : ("asc" as const),
            },
          ]
        : [],
    ),
    filters: providers.has(String(providerType))
      ? {
          providerType: providerType as
            | "SMTP"
            | "MICROSOFT_GRAPH"
            | "AWS_SES"
            | "SENDGRID"
            | "MAILGUN"
            | "POSTMARK"
            | "RESEND"
            | "GENERAL_API",
        }
      : undefined,
  };
  const { data, isLoading, error, refetch } =
    trpc.mailSending.list.useQuery(queryInput);
  const remove = trpc.mailSending.delete.useMutation();
  const target = confirmation.type === "delete" ? confirmation.profile : null;
  async function onDelete() {
    if (!target || remove.isPending) return;
    reset();
    try {
      await remove.mutateAsync({ id: target.id });
      await utils.mailSending.list.invalidate();
      setConfirmation({ type: "closed" });
    } catch {
      setError(t("sendingProfiles.deleteError"));
    }
  }
  return {
    t,
    locale,
    rows: data?.profiles ?? [],
    total: data?.total ?? 0,
    state,
    onStateChange,
    loading: isLoading,
    error: error ? t("sendingProfiles.loadError") : undefined,
    onRetry: () => void refetch(),
    target,
    deleting: remove.isPending,
    deleteError: status.type === "error" ? status.message : "",
    onCreate: () => router.push("/sending-profiles/new"),
    onEdit: (id) => router.push(`/sending-profiles/${id}`),
    onAskDelete: (profile) => {
      reset();
      setConfirmation({ type: "delete", profile });
    },
    onCancelDelete: () => {
      if (!remove.isPending) {
        reset();
        setConfirmation({ type: "closed" });
      }
    },
    onDelete: () => void onDelete(),
  };
}
