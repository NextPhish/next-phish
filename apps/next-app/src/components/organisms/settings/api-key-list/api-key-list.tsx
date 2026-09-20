"use client";
import { useReducer } from "react";
import { Button, Dialog, FormMessage } from "@next-phish/ui";
import { trpc } from "@/src/lib/trpc";
import { useTranslation } from "@/src/lib/i18n";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { ApiKeyForm } from "../api-key-form";
import { ApiKeyCreatedDialog } from "../api-key-form/parts/api-key-created-dialog";
import { ApiKeyListView } from "./parts/api-key-list-view";
import type { ApiKeyView } from "./types/api-key.types";

type ModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "created"; key: string }
  | { type: "revoke"; key: ApiKeyView };
const EMPTY_KEYS: ApiKeyView[] = [];
export function ApiKeyList() {
  const t = useTranslation();
  const [modal, setModal] = useReducer(
    (_: ModalState, next: ModalState) => next,
    { type: "closed" },
  );
  const { status, setError, setSuccess, reset } = useFormStatus();
  const utils = trpc.useUtils();
  const { data, isLoading, error, refetch } = trpc.apiKey.list.useQuery();
  const revoke = trpc.apiKey.delete.useMutation();
  const keys =
    (data as { apiKeys: ApiKeyView[] } | undefined)?.apiKeys ?? EMPTY_KEYS;
  async function confirmRevoke() {
    if (modal.type !== "revoke") return;
    reset();
    try {
      await revoke.mutateAsync({ keyId: modal.key.id });
      setModal({ type: "closed" });
      setSuccess(t("apiKeys.deleted"));
      await utils.apiKey.list.invalidate();
    } catch {
      setError(t("apiKeys.revokeError"));
    }
  }
  return (
    <div className="space-y-4">
      {status.type === "success" && (
        <FormMessage variant="success">{status.message}</FormMessage>
      )}
      <ApiKeyListView
        keys={keys}
        loading={isLoading}
        error={error ? t("apiKeys.loadError") : undefined}
        onRetry={() => void refetch()}
        onCreate={() => {
          reset();
          setModal({ type: "create" });
        }}
        onRevoke={(key) => {
          reset();
          setModal({ type: "revoke", key });
        }}
      />
      {modal.type === "create" && (
        <ApiKeyForm
          visible
          onHide={() => setModal({ type: "closed" })}
          onCreated={(key) => {
            setModal({ type: "created", key });
            void utils.apiKey.list.invalidate();
          }}
        />
      )}
      {modal.type === "created" && (
        <ApiKeyCreatedDialog
          apiKey={modal.key}
          onHide={() => setModal({ type: "closed" })}
        />
      )}
      <Dialog
        open={modal.type === "revoke"}
        onOpenChange={(open) => {
          if (!open && !revoke.isPending) setModal({ type: "closed" });
        }}
        title={t("apiKeys.deleteTitle")}
        description={t("apiKeys.deleteConfirm", {
          name:
            modal.type === "revoke"
              ? (modal.key.name ?? modal.key.start ?? modal.key.id)
              : "",
        })}
        closeLabel={t("common.cancel")}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModal({ type: "closed" })}
              disabled={revoke.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => void confirmRevoke()}
              loading={revoke.isPending}
            >
              {t("apiKeys.revoke")}
            </Button>
          </>
        }
      >
        {status.type === "error" && (
          <FormMessage variant="error">{status.message}</FormMessage>
        )}
      </Dialog>
    </div>
  );
}
