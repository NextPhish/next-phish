"use client";
import type { UserDeletionPreview, UserView } from "@next-phish/backend";
import { Button, Dialog, FormMessage, Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
interface Props {
  user: UserView;
  preview?: UserDeletionPreview;
  previewLoading: boolean;
  previewError: boolean;
  onRetry: () => void;
  orphanAction: "keep" | "delete";
  onOrphanActionChange: (value: "keep" | "delete") => void;
  canDelete: boolean;
  pending: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
}
export function DeleteUserView(props: Props) {
  const t = useTranslation();
  const { preview } = props;
  return (
    <Dialog
      open
      title={t("usersUi.deleteTitle", { name: props.user.name })}
      description={t("usersUi.deleteWarning")}
      closeLabel={t("common.close")}
      dismissible={!props.pending}
      onOpenChange={(open) => {
        if (!open && !props.pending) props.onClose();
      }}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            disabled={props.pending}
            onClick={props.onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            disabled={!props.canDelete}
            loading={props.pending}
            onClick={props.onConfirm}
          >
            {t("usersUi.deletePermanently")}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 text-sm text-[var(--np-muted)]">
        {props.previewLoading ? (
          <div
            role="status"
            aria-label={t("usersUi.checkingData")}
            className="grid gap-3"
          >
            <Skeleton style={{ width: "100%", height: "5rem" }} />
            <Skeleton style={{ width: "80%", height: "7rem" }} />
          </div>
        ) : props.previewError || !preview ? (
          <FormMessage
            variant="error"
            action={
              <Button variant="secondary" size="sm" onClick={props.onRetry}>
                {t("tableUi.retry")}
              </Button>
            }
          >
            {t("usersUi.previewError")}
          </FormMessage>
        ) : (
          <>
            {preview.ownedOrganizations.length ? (
              <section className="rounded-xl border border-[var(--np-danger)] bg-[var(--np-surface-subtle)] p-4 [&_strong]:text-[var(--np-danger)]">
                <strong>{t("usersUi.ownedWarning")}</strong>
                <p>{t("usersUi.ownedConsequences")}</p>
                <ul className="list-inside list-disc">
                  {preview.ownedOrganizations.map((org) => (
                    <li key={org.id}>{org.name}</li>
                  ))}
                </ul>
              </section>
            ) : (
              <p>{t("usersUi.survivingData")}</p>
            )}
            {preview.orphanedUsers.length ? (
              <fieldset className="grid gap-3">
                <legend className="font-semibold text-[var(--np-ink)]">
                  {t("usersUi.orphanCount", {
                    count: preview.orphanedUsers.length,
                  })}
                </legend>
                {(["keep", "delete"] as const).map((choice) => (
                  <label
                    key={choice}
                    className="flex items-start gap-3 rounded-xl border border-[var(--np-border)] p-[0.8rem] text-[var(--np-muted)] [&_strong]:block [&_strong]:text-[var(--np-ink)]"
                  >
                    <input
                      type="radio"
                      name="orphanAction"
                      checked={props.orphanAction === choice}
                      disabled={props.pending}
                      onChange={() => props.onOrphanActionChange(choice)}
                    />
                    <span>
                      <strong>
                        {t(
                          choice === "keep"
                            ? "usersUi.keepOrphans"
                            : "usersUi.deleteOrphans",
                        )}
                      </strong>
                      {t(
                        choice === "keep"
                          ? "usersUi.keepHint"
                          : "usersUi.deleteOrphansHint",
                      )}
                    </span>
                  </label>
                ))}
                <ul>
                  {preview.orphanedUsers.map((orphan) => (
                    <li key={orphan.id}>
                      {orphan.name} — {orphan.email}
                    </li>
                  ))}
                </ul>
              </fieldset>
            ) : null}
          </>
        )}
        {props.error && (
          <FormMessage variant="error">{props.error}</FormMessage>
        )}
      </div>
    </Dialog>
  );
}
