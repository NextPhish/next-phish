import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, useFormikContext } from "formik";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CampaignFormValues } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { CampaignForm } from "../../../../apps/next-app/src/components/organisms/campaigns";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  campaign: undefined as undefined | Record<string, unknown>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock(
  "@/src/components/organisms/campaigns/campaign-form/hooks/use-campaign-authoring",
  () => ({
    useCampaignAuthoring: () => ({
      campaign: { data: mocks.campaign },
      isLoading: false,
      create: { mutateAsync: mocks.create },
      update: { mutateAsync: mocks.update },
      createSchedule: { mutateAsync: mocks.createSchedule },
      updateSchedule: { mutateAsync: mocks.updateSchedule },
      emailTemplates: [],
      pages: [],
      sendingProfiles: [],
      targetGroups: [],
    }),
  }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/campaigns/campaign-form/parts/campaign-form-view",
  () => ({
    CampaignFormView: () => {
      const form = useFormikContext<CampaignFormValues>();
      return (
        <Form>
          <button
            type="button"
            onClick={() =>
              void form.setValues({
                ...form.values,
                name: "Quarterly awareness",
                tags: ["training"],
                type: "CONCRETE",
                status: "PUBLISHED",
                emailTemplateId: "email-1",
                pageId: "page-1",
                mailSendingProfileId: "profile-1",
                targetGroupId: "group-1",
                targetTimezone: "UTC",
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
              })
            }
          >
            Fill
          </button>
          <button type="submit">Save</button>
        </Form>
      );
    },
  }),
);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.campaign = undefined;
  mocks.create.mockResolvedValue({
    id: "campaign-1",
    targetGroupId: "group-1",
  });
  mocks.createSchedule.mockResolvedValue({ id: "schedule-1" });
});

describe("campaign authoring mutations", () => {
  it("creates the campaign and its one-time batch schedule from validated Formik values", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider initialLocale="en">
        <CampaignForm />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Fill" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(mocks.createSchedule).toHaveBeenCalled());
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Quarterly awareness",
        tags: ["training"],
        type: "CONCRETE",
        targetGroupId: "group-1",
        autoCompleteAfterDays: 20,
      }),
    );
    expect(mocks.createSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceCampaignIds: ["campaign-1"],
        type: "ONE_TIME",
        deliveryMode: "BATCH",
        batchSize: 100,
        batchIntervalMinutes: 30,
        dripEmailsPerMinute: null,
        startsAt: new Date("2026-09-20T09:30"),
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/campaigns/campaign-1?saved=created",
    );
  });
});
