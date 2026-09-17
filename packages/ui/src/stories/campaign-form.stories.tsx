import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import type { CampaignFormValues } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignFormPresentation } from "../../../../apps/next-app/src/components/organisms/campaigns/form-presentation";

const values: CampaignFormValues = {
  name: "Quarterly security awareness",
  tags: ["security", "quarterly"],
  type: "CONCRETE",
  status: "PUBLISHED",
  emailTemplateId: "email-1",
  pageId: "page-1",
  mailSendingProfileId: "profile-1",
  targetGroupId: "group-1",
  targetTimezone: "Europe/Sofia",
  automaticallyComplete: true,
  autoCompleteAfterDays: 20,
  scheduleEnabled: true,
  scheduleName: "Quarterly awareness",
  scheduleStartsAt: "2026-09-20T09:30",
  scheduleTargetTimezone: "Europe/Sofia",
  scheduleDeliveryMode: "BATCH",
  scheduleDripEmailsPerMinute: null,
  scheduleBatchSize: 100,
  scheduleBatchIntervalMinutes: 30,
};
function Preview() {
  return (
    <I18nProvider initialLocale="en">
      <Formik initialValues={values} onSubmit={() => undefined}>
        <CampaignFormPresentation
          isEdit={false}
          emailTemplates={[
            {
              id: "email-1",
              name: "Password expiry",
              status: "ACTIVE",
              html: "<p>Password reset</p>",
              preview: null,
            } as never,
          ]}
          emailTemplatesTotal={1}
          emailTemplatesLoading={false}
          emailTemplateCatalogState={{
            input: "",
            search: "",
            offset: 0,
            limit: 6,
          }}
          setEmailTemplateSearch={() => undefined}
          setEmailTemplatePage={() => undefined}
          pages={[
            {
              id: "page-1",
              name: "Sign-in page",
              status: "ACTIVE",
              html: "<p>Sign in</p>",
              preview: null,
            } as never,
          ]}
          pagesTotal={1}
          pagesLoading={false}
          pageCatalogState={{ input: "", search: "", offset: 0, limit: 6 }}
          setPageSearch={() => undefined}
          setPagePage={() => undefined}
          sendingProfiles={[
            {
              id: "profile-1",
              name: "Security team",
              providerType: "SMTP",
              fromEmail: "security@example.com",
            },
          ]}
          sendingProfilesLoading={false}
          sendingProfileSearch=""
          setSendingProfileSearch={() => undefined}
          targetGroups={[
            { id: "group-1", name: "All employees", userCount: 248 },
          ]}
          hasExistingSchedule={false}
          error=""
          onCancel={() => undefined}
        />
      </Formik>
    </I18nProvider>
  );
}
const meta = {
  title: "Screens/Campaigns/Form",
  component: Preview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Preview>;
export default meta;
export const PopulatedConcreteCampaign: StoryObj<typeof meta> = {};
