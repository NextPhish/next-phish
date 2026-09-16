"use client";
import { Formik } from "formik";
import { Button, Skeleton } from "@next-phish/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { trpc } from "@/src/lib/trpc";
import { SendingProfileFormPresentation } from "./sending-profile-form-presentation";
import { TestEmailDialog } from "./test-email-dialog";
import {
  createSendingProfilePayload,
  defaultSendingProfileValues,
  sendingProfileValuesFromView,
  updateSendingProfilePayload,
} from "./sending-profile-values";
import { sendingProfileValidator } from "./sending-profile-validation";

export function SendingProfileFormContainer({
  profileId,
}: {
  profileId?: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { status, setError, reset } = useFormStatus();
  const [showTestDialog, setShowTestDialog] = useState(false);
  const {
    data: profile,
    isLoading,
    error: loadError,
    refetch,
  } = trpc.mailSending.getById.useQuery(
    { id: profileId ?? "" },
    { enabled: Boolean(profileId) },
  );
  const create = trpc.mailSending.create.useMutation();
  const update = trpc.mailSending.update.useMutation();
  async function handleSubmit(values: SendingProfileFormValues) {
    reset();
    try {
      if (profileId)
        await update.mutateAsync(
          updateSendingProfilePayload(profileId, values),
        );
      else await create.mutateAsync(createSendingProfilePayload(values));
      await utils.mailSending.list.invalidate();
      if (profileId)
        await utils.mailSending.getById.invalidate({ id: profileId });
      router.push("/sending-profiles");
    } catch {
      setError(
        t(
          profileId
            ? "sendingProfiles.updateError"
            : "sendingProfiles.createError",
        ),
      );
    }
  }
  if (profileId && isLoading)
    return (
      <div
        role="status"
        aria-label={t("common.loading")}
        style={{ display: "grid", gap: 18 }}
      >
        <Skeleton style={{ width: "36%", height: 32 }} />
        <Skeleton style={{ width: "100%", height: 460, borderRadius: 12 }} />
      </div>
    );
  if (loadError)
    return (
      <div role="alert">
        {t("sendingProfiles.loadError")}{" "}
        <Button
          type="button"
          variant="secondary"
          onClick={() => void refetch()}
        >
          {t("tableUi.retry")}
        </Button>
      </div>
    );
  if (profileId && !profile)
    return <p role="status">{t("sendingProfiles.notFound")}</p>;
  return (
    <>
      <Formik<SendingProfileFormValues>
        initialValues={
          profile
            ? sendingProfileValuesFromView(profile)
            : defaultSendingProfileValues()
        }
        validate={sendingProfileValidator(t)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <SendingProfileFormPresentation
          error={status.type === "error" ? status.message : ""}
          isEdit={Boolean(profileId)}
          onCancel={() => router.push("/sending-profiles")}
          onTest={() => setShowTestDialog(true)}
        />
      </Formik>
      {profileId && (
        <TestEmailDialog
          profileId={profileId}
          visible={showTestDialog}
          onHide={() => setShowTestDialog(false)}
        />
      )}
    </>
  );
}
