"use client";

import { useCallback, useState } from "react";
import { ErrorMessage, Form, useFormikContext } from "formik";
import {
  Button,
  FormErrorSummary,
  FormMessage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@next-phish/ui";
import type {
  CampaignFormValues,
  EmailTemplateListItemView,
  PageListItemView,
} from "@next-phish/shared";
import type { CatalogPageState } from "@/src/hooks/use-campaign-catalog-state";
import { AssetCatalogTab } from "@/src/components/organisms/catalog/asset-catalog";
import { GeneralTab } from "./general-tab";
import { ScheduleTab } from "./schedule-tab";
import { SendingProfileTab } from "./sending-profile-tab";
import styles from "./campaign-form.module.css";
import { useTranslation } from "@/src/lib/i18n/client";

interface CampaignFormPresentationProps {
  isEdit: boolean;
  emailTemplates: EmailTemplateListItemView[];
  emailTemplatesTotal: number;
  emailTemplatesLoading: boolean;
  emailTemplateCatalogState: CatalogPageState;
  setEmailTemplateSearch: (value: string) => void;
  setEmailTemplatePage: (offset: number, limit: number) => void;
  pages: PageListItemView[];
  pagesTotal: number;
  pagesLoading: boolean;
  pageCatalogState: CatalogPageState;
  setPageSearch: (value: string) => void;
  setPagePage: (offset: number, limit: number) => void;
  sendingProfiles: Array<{
    id: string;
    name: string;
    providerType?: string;
    fromEmail?: string;
  }>;
  sendingProfilesLoading: boolean;
  sendingProfileSearch: string;
  setSendingProfileSearch: (value: string) => void;
  targetGroups: Array<{ id: string; name: string; userCount: number }>;
  hasExistingSchedule: boolean;
  error: string;
  onCancel: () => void;
}

const fieldTab: Record<string, string> = {
  emailTemplateId: "email",
  pageId: "page",
  mailSendingProfileId: "profile",
  scheduleName: "schedule",
  scheduleStartsAt: "schedule",
  scheduleTargetTimezone: "schedule",
  scheduleDeliveryMode: "schedule",
  scheduleDripEmailsPerMinute: "schedule",
  scheduleBatchSize: "schedule",
  scheduleBatchIntervalMinutes: "schedule",
};

export function CampaignFormPresentation({
  isEdit,
  emailTemplates,
  emailTemplatesTotal,
  emailTemplatesLoading,
  emailTemplateCatalogState,
  setEmailTemplateSearch,
  setEmailTemplatePage,
  pages,
  pagesTotal,
  pagesLoading,
  pageCatalogState,
  setPageSearch,
  setPagePage,
  sendingProfiles,
  sendingProfilesLoading,
  sendingProfileSearch,
  setSendingProfileSearch,
  targetGroups,
  hasExistingSchedule,
  error,
  onCancel,
}: CampaignFormPresentationProps) {
  const t = useTranslation();
  const { values, errors, submitCount, setFieldValue, isSubmitting } =
    useFormikContext<CampaignFormValues>();
  const [activeTab, setActiveTab] = useState("general");
  const visibleErrors = submitCount
    ? Object.entries(errors).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      )
    : [];
  const firstError = visibleErrors[0]?.[0];
  const validationKey = `${submitCount}:${firstError ?? ""}`;
  const [previousValidationKey, setPreviousValidationKey] =
    useState(validationKey);
  if (previousValidationKey !== validationKey) {
    setPreviousValidationKey(validationKey);
    if (firstError) setActiveTab(fieldTab[firstError] ?? "general");
  }
  function revealField(field: string) {
    setActiveTab(fieldTab[field] ?? "general");
    window.setTimeout(
      () => document.getElementById(`campaign-field-${field}`)?.focus(),
      0,
    );
  }
  const recipientCount =
    targetGroups.find((group) => group.id === values.targetGroupId)
      ?.userCount ?? 0;
  const selectEmailTemplate = useCallback(
    (id: string) => void setFieldValue("emailTemplateId", id),
    [setFieldValue],
  );
  const selectPage = useCallback(
    (id: string) => void setFieldValue("pageId", id),
    [setFieldValue],
  );
  const catalogLabels = {
    preview: (name: string) => t("campaignsUi.previewOf", { name }),
    select: (name: string) => t("campaignsUi.selectAsset", { name }),
    unavailable: t("campaignsUi.previewUnavailable"),
    perPage: t("campaignsUi.itemsPerPage"),
    page: (page: number, pages: number) =>
      t("campaignsUi.pageOf", { page, pages }),
    previous: t("campaignsUi.previous"),
    next: t("campaignsUi.next"),
  };

  return (
    <Form className={styles.form} noValidate>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">{t("campaignsUi.general")}</TabsTrigger>
          <TabsTrigger value="email">
            {t("campaignsUi.emailTemplate")}
          </TabsTrigger>
          <TabsTrigger value="page">{t("campaignsUi.landingPage")}</TabsTrigger>
          <TabsTrigger value="profile">
            {t("campaignsUi.sendingProfile")}
          </TabsTrigger>
          {values.type === "CONCRETE" && (
            <TabsTrigger value="schedule">
              {t("campaignsUi.schedule")}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="general">
          <GeneralTab targetGroups={targetGroups} isEdit={isEdit} />
        </TabsContent>
        <TabsContent value="email">
          <div id="campaign-field-emailTemplateId" tabIndex={-1}>
            <AssetCatalogTab
              title={t("campaignsUi.emailTemplate")}
              description={t("campaignsUi.emailDescription")}
              searchPlaceholder={t("campaignsUi.searchEmail")}
              emptyMessage={t("campaignsUi.noEmail")}
              items={emailTemplates}
              total={emailTemplatesTotal}
              loading={emailTemplatesLoading}
              selectedId={values.emailTemplateId}
              search={emailTemplateCatalogState.input}
              offset={emailTemplateCatalogState.offset}
              limit={emailTemplateCatalogState.limit}
              onSearch={setEmailTemplateSearch}
              onPage={setEmailTemplatePage}
              onSelect={selectEmailTemplate}
              labels={catalogLabels}
            />
          </div>
          <ErrorMessage
            name="emailTemplateId"
            component="p"
            className="mt-3 text-sm text-red-400"
          />
        </TabsContent>
        <TabsContent value="page">
          <div id="campaign-field-pageId" tabIndex={-1}>
            <AssetCatalogTab
              title={t("campaignsUi.landingPage")}
              description={t("campaignsUi.pageDescription")}
              searchPlaceholder={t("campaignsUi.searchPages")}
              emptyMessage={t("campaignsUi.noPages")}
              items={pages}
              total={pagesTotal}
              loading={pagesLoading}
              selectedId={values.pageId}
              search={pageCatalogState.input}
              offset={pageCatalogState.offset}
              limit={pageCatalogState.limit}
              onSearch={setPageSearch}
              onPage={setPagePage}
              onSelect={selectPage}
              labels={catalogLabels}
            />
          </div>
          <ErrorMessage
            name="pageId"
            component="p"
            className="mt-3 text-sm text-red-400"
          />
        </TabsContent>
        <TabsContent value="profile">
          <SendingProfileTab
            profiles={sendingProfiles}
            loading={sendingProfilesLoading}
            search={sendingProfileSearch}
            onSearch={setSendingProfileSearch}
          />
        </TabsContent>
        {values.type === "CONCRETE" ? (
          <TabsContent value="schedule">
            <ScheduleTab
              recipientCount={recipientCount}
              hasExistingSchedule={hasExistingSchedule}
            />
          </TabsContent>
        ) : null}
      </Tabs>

      <section className={styles.card}>
        {visibleErrors.length > 0 && (
          <div
            className="mb-4"
            onClickCapture={(event) => {
              const link = (event.target as HTMLElement).closest(
                "a[href^='#campaign-field-']",
              );
              const field = link
                ?.getAttribute("href")
                ?.replace("#campaign-field-", "");
              if (field) {
                event.preventDefault();
                revealField(field);
              }
            }}
            onKeyDownCapture={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              const link = (event.target as HTMLElement).closest(
                "a[href^='#campaign-field-']",
              );
              const field = link
                ?.getAttribute("href")
                ?.replace("#campaign-field-", "");
              if (field) {
                event.preventDefault();
                revealField(field);
              }
            }}
          >
            <FormErrorSummary
              title={t("campaignsUi.formErrorsTitle")}
              errors={visibleErrors.map(([field, message]) => ({
                id: `campaign-field-${field}`,
                message,
              }))}
            />
          </div>
        )}
        {error ? (
          <div className="mb-4">
            <FormMessage variant="error">{error}</FormMessage>
          </div>
        ) : null}
        <div className={styles.actions}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {values.status === "PUBLISHED"
              ? t("campaignsUi.savePublish")
              : t("campaignsUi.saveDraft")}
          </Button>
        </div>
      </section>
    </Form>
  );
}
