"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";

import { authClient } from "@/src/lib/auth-client";
import { profileValidator } from "./profile-validation";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { type Locale, useSetLocale, useTranslation } from "@/src/lib/i18n";
import {
  GeneralTabPresentation,
  type GeneralValues,
} from "./general-tab-presentation";

export interface GeneralTabUser {
  id: string;
  name: string;
  email: string;
  timezone?: string | null;
  language?: string | null;
}

function getTimezones(currentTimezone?: string | null): string[] {
  try {
    return Array.from(
      new Set([
        "UTC",
        ...(currentTimezone ? [currentTimezone] : []),
        ...Intl.supportedValuesOf("timeZone"),
      ]),
    );
  } catch {
    return Array.from(
      new Set(["UTC", ...(currentTimezone ? [currentTimezone] : [])]),
    );
  }
}

export function GeneralTab({ user }: { user: GeneralTabUser }) {
  const t = useTranslation();
  const setLocale = useSetLocale();
  const router = useRouter();
  const { status, setError, setSuccess, reset } = useFormStatus();
  const validate = profileValidator(t);

  async function handleSubmit(values: GeneralValues) {
    reset();
    try {
      const { error } = await authClient.updateUser({
        name: values.name,
        timezone: values.timezone,
        language: values.language,
      } as Parameters<typeof authClient.updateUser>[0]);
      if (error) {
        setError(t("settings.failedToUpdateProfile"));
        return;
      }
      setLocale(values.language as Locale);
      router.refresh();
      setSuccess(t("settings.profileUpdated"));
    } catch {
      setError(t("settings.unexpectedProfileError"));
    }
  }

  return (
    <Formik<GeneralValues>
      initialValues={{
        name: user.name,
        timezone: user.timezone || "UTC",
        language: user.language || "en",
      }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      <GeneralTabPresentation
        email={user.email}
        timezones={getTimezones(user.timezone)}
        error={status.type === "error" ? status.message : ""}
        success={status.type === "success" ? status.message : ""}
      />
    </Formik>
  );
}
