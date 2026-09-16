"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { PageHeader, Skeleton } from "@next-phish/ui";
import type { CampaignFormValues } from "@next-phish/shared";
import { useCampaignAuthoring } from "@/src/hooks/use-campaign-authoring";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { CampaignFormPresentation } from "./form-presentation";
import { campaignFormValidator } from "./campaign-form-validation";
import { buildCampaignPayload } from "./form-payload";

function toLocalInput(value: Date | string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function CampaignFormContainer({ campaignId }: { campaignId?: string }) {
  const router = useRouter();
  const t = useTranslation();
  const { status, setError, reset } = useFormStatus();
  const authoring = useCampaignAuthoring(campaignId);
  const {
    campaign,
    isLoading,
    create,
    update,
    createSchedule,
    updateSchedule,
  } = authoring;

  if (isLoading)
    return <Skeleton style={{ height: "36rem", borderRadius: "1rem" }} />;
  if (campaignId && !campaign.data)
    return (
      <p className="p-8 text-[var(--np-muted)]">{t("campaignsUi.notFound")}</p>
    );

  const row = campaign.data;
  const existingSchedule = row?.scheduleSources
    .map((source) => source.schedule)
    .find((schedule) => !["COMPLETED", "CANCELLED"].includes(schedule.status));
  const defaultTimezone =
    row?.targetTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const initialValues: CampaignFormValues = {
    name: row?.name ?? "",
    tags: row?.tags ?? [],
    type: row?.type ?? "CONCRETE",
    status:
      (row?.type ?? "CONCRETE") === "CONCRETE" || row?.status === "PUBLISHED"
        ? "PUBLISHED"
        : "DRAFT",
    emailTemplateId: row?.emailTemplateId ?? "",
    pageId: row?.pageId ?? "",
    mailSendingProfileId: row?.mailSendingProfileId ?? "",
    targetGroupId: row?.targetGroupId ?? null,
    targetTimezone: defaultTimezone,
    automaticallyComplete: row?.autoCompleteAfterDays !== null,
    autoCompleteAfterDays: row?.autoCompleteAfterDays ?? 20,
    scheduleEnabled:
      (row?.type ?? "CONCRETE") === "CONCRETE" || Boolean(existingSchedule),
    scheduleName: row?.name ?? existingSchedule?.name ?? "Campaign",
    scheduleStartsAt: toLocalInput(existingSchedule?.startsAt ?? new Date()),
    scheduleTargetTimezone: existingSchedule?.targetTimezone ?? defaultTimezone,
    scheduleDeliveryMode: existingSchedule?.deliveryMode ?? "BLAST",
    scheduleDripEmailsPerMinute: existingSchedule?.dripEmailsPerMinute ?? null,
    scheduleBatchSize: existingSchedule?.batchSize ?? null,
    scheduleBatchIntervalMinutes:
      existingSchedule?.batchIntervalMinutes ?? null,
  };

  async function submit(values: CampaignFormValues) {
    reset();
    const campaignPayload = buildCampaignPayload(values);

    try {
      const saved = campaignId
        ? await update.mutateAsync({ id: campaignId, data: campaignPayload })
        : await create.mutateAsync(campaignPayload);

      if (values.type === "CONCRETE" && values.scheduleEnabled) {
        const schedulePayload = {
          name: values.name,
          type: "ONE_TIME" as const,
          sourceCampaignIds: [saved.id],
          targetGroupId: saved.targetGroupId,
          targetTimezone: values.scheduleTargetTimezone,
          startsAt: new Date(values.scheduleStartsAt),
          frequency: null,
          localTimeMinutes: null,
          weekday: null,
          dayOfMonth: null,
          month: null,
          selectionStrategy: null,
          shuffleDeck: false,
          deliveryMode: values.scheduleDeliveryMode,
          dripEmailsPerMinute:
            values.scheduleDeliveryMode === "DRIP"
              ? values.scheduleDripEmailsPerMinute
              : null,
          batchSize:
            values.scheduleDeliveryMode === "BATCH"
              ? values.scheduleBatchSize
              : null,
          batchIntervalMinutes:
            values.scheduleDeliveryMode === "BATCH"
              ? values.scheduleBatchIntervalMinutes
              : null,
          maxCampaigns: null,
          endsAt: null,
          autoCompleteAfterDays: campaignPayload.autoCompleteAfterDays,
        };
        if (existingSchedule)
          await updateSchedule.mutateAsync({
            id: existingSchedule.id,
            data: schedulePayload,
          });
        else await createSchedule.mutateAsync(schedulePayload);
      }

      router.push(
        `/campaigns/${saved.id}?saved=${campaignId ? "updated" : "created"}`,
      );
    } catch {
      setError(t("campaignsUi.saveError"));
    }
  }

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title={campaignId ? t("campaignsUi.edit") : t("campaignsUi.create")}
        description={t("campaignsUi.formDescription")}
      />
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validate={campaignFormValidator(t)}
        onSubmit={submit}
      >
        <CampaignFormPresentation
          isEdit={Boolean(campaignId)}
          emailTemplates={authoring.emailTemplates}
          emailTemplatesTotal={authoring.emailTemplatesTotal}
          emailTemplatesLoading={authoring.emailTemplatesLoading}
          emailTemplateCatalogState={authoring.emailTemplateCatalogState}
          setEmailTemplateSearch={authoring.setEmailTemplateSearch}
          setEmailTemplatePage={authoring.setEmailTemplatePage}
          pages={authoring.pages}
          pagesTotal={authoring.pagesTotal}
          pagesLoading={authoring.pagesLoading}
          pageCatalogState={authoring.pageCatalogState}
          setPageSearch={authoring.setPageSearch}
          setPagePage={authoring.setPagePage}
          sendingProfiles={authoring.sendingProfiles}
          sendingProfilesLoading={authoring.sendingProfilesLoading}
          sendingProfileSearch={authoring.sendingProfileSearch}
          setSendingProfileSearch={authoring.setSendingProfileSearch}
          targetGroups={authoring.targetGroups}
          hasExistingSchedule={Boolean(existingSchedule)}
          error={status.type === "error" ? status.message : ""}
          onCancel={() => router.push("/campaigns")}
        />
      </Formik>
    </div>
  );
}
