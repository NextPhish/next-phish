"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SendingProfileFormValues } from "@next-phish/shared";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import { trpc } from "@/src/lib/trpc";
import {
  createSendingProfilePayload,
  defaultSendingProfileValues,
  sendingProfileValuesFromView,
  updateSendingProfilePayload,
} from "../sending-profile-values";
import { sendingProfileValidator } from "../sending-profile-validation";

export function useSendingProfileForm(profileId?: string) {
  const t = useTranslation();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { status, setError, reset } = useFormStatus();
  const [showTestDialog, setShowTestDialog] = useState(false);
  const profileQuery = trpc.mailSending.getById.useQuery(
    { id: profileId ?? "" },
    { enabled: Boolean(profileId) },
  );
  const create = trpc.mailSending.create.useMutation();
  const update = trpc.mailSending.update.useMutation();

  async function submit(values: SendingProfileFormValues) {
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

  return {
    t,
    profileId,
    profileQuery,
    initialValues: profileQuery.data
      ? sendingProfileValuesFromView(profileQuery.data)
      : defaultSendingProfileValues(),
    validate: sendingProfileValidator(t),
    submit,
    error: status.type === "error" ? status.message : "",
    cancel: () => router.push("/sending-profiles"),
    showTestDialog,
    openTestDialog: () => setShowTestDialog(true),
    closeTestDialog: () => setShowTestDialog(false),
  };
}
