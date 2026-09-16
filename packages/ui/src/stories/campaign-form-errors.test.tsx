import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { describe, expect, it } from "vitest";
import type { CampaignFormValues } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignFormPresentation } from "../../../../apps/next-app/src/components/organisms/campaigns/form-presentation";
import { campaignFormValidator } from "../../../../apps/next-app/src/components/organisms/campaigns/campaign-form-validation";
import { useTranslation } from "../../../../apps/next-app/src/lib/i18n/client";

const values: CampaignFormValues = {
  name: "",
  tags: [],
  type: "CONCRETE",
  status: "PUBLISHED",
  emailTemplateId: "",
  pageId: "",
  mailSendingProfileId: "",
  targetGroupId: null,
  targetTimezone: "UTC",
  automaticallyComplete: false,
  autoCompleteAfterDays: null,
  scheduleEnabled: true,
  scheduleName: "Campaign",
  scheduleStartsAt: "",
  scheduleTargetTimezone: "UTC",
  scheduleDeliveryMode: "BLAST",
  scheduleDripEmailsPerMinute: null,
  scheduleBatchSize: null,
  scheduleBatchIntervalMinutes: null,
};

function InvalidForm() {
  const t = useTranslation();
  return (
    <Formik
      initialValues={values}
      validate={campaignFormValidator(t)}
      onSubmit={() => undefined}
    >
      <CampaignFormPresentation
        isEdit={false}
        emailTemplates={[]}
        emailTemplatesTotal={0}
        emailTemplatesLoading={false}
        emailTemplateCatalogState={{
          input: "",
          search: "",
          offset: 0,
          limit: 6,
        }}
        setEmailTemplateSearch={() => undefined}
        setEmailTemplatePage={() => undefined}
        pages={[]}
        pagesTotal={0}
        pagesLoading={false}
        pageCatalogState={{ input: "", search: "", offset: 0, limit: 6 }}
        setPageSearch={() => undefined}
        setPagePage={() => undefined}
        sendingProfiles={[]}
        sendingProfilesLoading={false}
        sendingProfileSearch=""
        setSendingProfileSearch={() => undefined}
        targetGroups={[]}
        hasExistingSchedule={false}
        error=""
        onCancel={() => undefined}
      />
    </Formik>
  );
}

describe("campaign form validation summary", () => {
  it("exposes errors across inactive tabs and opens the selected field", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <InvalidForm />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /save and publish/i }));
    await waitFor(() =>
      expect(
        screen.getByText("Please check these campaign fields"),
      ).toBeVisible(),
    );
    const summary = screen
      .getByText("Please check these campaign fields")
      .closest('[role="alert"]')!;
    expect(summary).toHaveTextContent("Select an email template");
    expect(summary).toHaveTextContent("Select a sending profile");
    expect(summary).toHaveTextContent("Schedule start is required");
    await user.click(
      screen.getByRole("link", { name: "Select an email template" }),
    );
    expect(screen.getByRole("tab", { name: "Email template" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute(
        "id",
        "campaign-field-emailTemplateId",
      ),
    );
    await user.click(
      screen.getByRole("link", { name: "Select a sending profile" }),
    );
    expect(
      screen.getByRole("tab", { name: "Sending profile" }),
    ).toHaveAttribute("data-state", "active");
    await user.click(
      screen.getByRole("link", { name: "Schedule start is required" }),
    );
    expect(screen.getByRole("tab", { name: "Schedule" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });
});
