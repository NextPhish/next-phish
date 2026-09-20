"use client";

import { useState } from "react";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { trpc } from "@/src/lib/trpc";
import { validateAddMember } from "../validation";

export function useAddMember(organizationId: string, onCreated: () => void) {
  const t = useTranslation();
  const utils = trpc.useUtils();
  const mutation = trpc.organization.createMember.useMutation();
  const lookup = trpc.organization.lookupMemberEmail.useMutation();
  const addExisting = trpc.organization.addExistingMember.useMutation();
  const resend = trpc.organization.resendMemberWelcome.useMutation();
  const { status, setError, reset } = useFormStatus();
  const [pendingUserId, setPendingUserId] = useState<string>();
  const [newEmail, setNewEmail] = useState<string>();
  const [existing, setExisting] = useState<{ name: string; email: string }>();

  return {
    validate: (values: Parameters<typeof validateAddMember>[0]) => {
      const errors = validateAddMember(values, t);
      if (values.email.trim().toLowerCase() !== newEmail) delete errors.name;
      return errors;
    },
    needsName: Boolean(newEmail),
    existing,
    error: status.type === "error" ? status.message : "",
    welcomeWarning: pendingUserId ? t("organizations.welcomeNotQueued") : "",
    retrying: resend.isPending,
    retryWelcome: async () => {
      if (!pendingUserId) return;
      reset();
      try {
        await resend.mutateAsync({ organizationId, userId: pendingUserId });
        onCreated();
      } catch {
        setError(t("organizations.resendWelcomeError"));
      }
    },
    cancelExisting: () => setExisting(undefined),
    confirmingExisting: addExisting.isPending,
    confirmExisting: async () => {
      if (!existing) return;
      reset();
      try {
        await addExisting.mutateAsync({
          organizationId,
          email: existing.email,
        });
        await utils.organization.listMembers.invalidate();
        onCreated();
      } catch {
        setExisting(undefined);
        setError(t("organizations.addExistingError"));
      }
    },
    submit: async (values: { name: string; email: string }) => {
      reset();
      const email = values.email.trim().toLowerCase();
      try {
        if (newEmail !== email) {
          const found = await lookup.mutateAsync({ organizationId, email });
          if (found.status === "EXISTING") {
            setExisting({ name: found.name, email: found.email });
            return;
          }
          if (found.status === "DISABLED") {
            setError(t("organizations.existingDisabled"));
            return;
          }
          if (found.status === "ALREADY_MEMBER") {
            setError(t("organizations.memberExists"));
            return;
          }
          setNewEmail(email);
          if (!values.name.trim()) return;
        }
        const result = await mutation.mutateAsync({
          organizationId,
          name: values.name.trim(),
          email,
        });
        await utils.organization.listMembers.invalidate();
        if (result.welcomeQueued === false) {
          setPendingUserId(result.user.id);
          return;
        }
        onCreated();
      } catch (error) {
        const conflict =
          typeof error === "object" &&
          error !== null &&
          "data" in error &&
          (error.data as { code?: string } | undefined)?.code === "CONFLICT";
        setError(
          t(
            conflict
              ? "organizations.memberExists"
              : "organizations.addMemberError",
          ),
        );
      }
    },
  };
}
