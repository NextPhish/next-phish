"use client";

import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { PageHeader, Skeleton } from "@next-phish/ui";
import type { CampaignFormValues } from "@next-phish/shared";
import { useCampaignAuthoring } from "./hooks/use-campaign-authoring";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n/client";
import { CampaignFormView } from "./parts/campaign-form-view";
import { campaignFormValidator } from "./parts/campaign-form-validation";
import { buildCampaignPayload } from "./parts/form-payload";
import {
  activeSchedule,
  buildSchedulePayload,
  campaignFormDefaults,
} from "./parts/form-defaults";

export function CampaignForm({ campaignId }: { campaignId?: string }) {
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

  const existingSchedule = activeSchedule(campaign.data);
  const initialValues = campaignFormDefaults(campaign.data, existingSchedule);

  async function submit(values: CampaignFormValues) {
    reset();
    const campaignPayload = buildCampaignPayload(values);

    try {
      const saved = campaignId
        ? await update.mutateAsync({ id: campaignId, data: campaignPayload })
        : await create.mutateAsync(campaignPayload);

      if (values.type === "CONCRETE" && values.scheduleEnabled) {
        const schedulePayload = buildSchedulePayload(
          values,
          saved,
          campaignPayload.autoCompleteAfterDays,
        );
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
        <CampaignFormView
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
