"use client";

import { ErrorMessage, useFormikContext } from "formik";
import { CheckCircle2, Search } from "lucide-react";
import { Input, Skeleton } from "@next-phish/ui";
import type { CampaignFormValues } from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n/client";

interface SendingProfileTabProps {
  profiles: Array<{
    id: string;
    name: string;
    providerType?: string;
    fromEmail?: string;
  }>;
  loading: boolean;
  search: string;
  onSearch: (value: string) => void;
}

export function SendingProfileTab({
  profiles,
  loading,
  search,
  onSearch,
}: SendingProfileTabProps) {
  const t = useTranslation();
  const { values, setFieldValue } = useFormikContext<CampaignFormValues>();

  return (
    <section
      id="campaign-field-mailSendingProfileId"
      tabIndex={-1}
      className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-surface)] p-5 shadow-sm"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--np-ink)]">
            {t("campaignsUi.sendingProfile")}
          </h2>
          <p className="mt-1 text-sm text-[var(--np-muted)]">
            {t("campaignsUi.profileDescription")}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--np-muted)]"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("campaignsUi.searchProfiles")}
            aria-label={t("campaignsUi.searchProfiles")}
            className="w-full pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              style={{ height: "7rem", borderRadius: ".75rem" }}
            />
          ))}
        </div>
      ) : profiles.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const selected = profile.id === values.mailSendingProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  void setFieldValue("mailSendingProfileId", profile.id)
                }
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-[var(--np-primary)] bg-[var(--np-tint)] ring-2 ring-[var(--np-tint)]"
                    : "border-[var(--np-border)] bg-[var(--np-surface)] hover:border-[var(--np-primary)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--np-ink)]">
                      {profile.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--np-muted)]">
                      {profile.providerType?.replaceAll("_", " ") ??
                        t("campaignsUi.sendingProfile")}
                    </p>
                    {profile.fromEmail ? (
                      <p className="mt-2 truncate text-xs text-[var(--np-muted)]">
                        {profile.fromEmail}
                      </p>
                    ) : null}
                  </div>
                  {selected ? (
                    <CheckCircle2
                      size={18}
                      className="text-[var(--np-primary)]"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--np-border)] px-5 py-12 text-center text-sm text-[var(--np-muted)]">
          {search
            ? t("campaignsUi.noProfilesSearch")
            : t("campaignsUi.noProfiles")}
        </p>
      )}

      <ErrorMessage
        name="mailSendingProfileId"
        component="p"
        className="mt-3 text-sm text-red-400"
      />
    </section>
  );
}
