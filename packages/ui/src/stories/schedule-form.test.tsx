import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, useFormikContext } from "formik";
import type { ScheduleFormValues } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { ScheduleFormContainer } from "../../../../apps/next-app/src/components/organisms/schedules/form-container";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  row: undefined as undefined | Record<string, unknown>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/src/lib/trpc", () => ({
  trpc: {
    campaign: {
      getSchedule: { useQuery: () => ({ data: mocks.row, isLoading: false }) },
      list: {
        useQuery: () => ({
          data: {
            rows: [{ id: "campaign-1", name: "Campaign", type: "CONCRETE" }],
          },
          isLoading: false,
        }),
      },
      createSchedule: { useMutation: () => ({ mutateAsync: mocks.create }) },
      updateSchedule: { useMutation: () => ({ mutateAsync: mocks.update }) },
    },
    targetGroup: {
      list: {
        useQuery: () => ({ data: { targetGroups: [] }, isLoading: false }),
      },
    },
  },
}));
vi.mock(
  "../../../../apps/next-app/src/components/organisms/schedules/form-presentation",
  () => ({
    ScheduleFormPresentation: () => {
      const form = useFormikContext<ScheduleFormValues>();
      return (
        <Form>
          <button
            type="button"
            onClick={() =>
              void form.setValues({
                ...form.values,
                name: "Awareness",
                sourceCampaignIds: ["campaign-1"],
                targetTimezone: "UTC",
                startsAt: "2026-09-20T09:30",
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

it("creates a one-time schedule with local inputs converted to dates", async () => {
  mocks.row = undefined;
  mocks.create.mockResolvedValue({ schedule: { id: "schedule-1" } });
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <ScheduleFormContainer />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Fill" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Awareness",
      startsAt: new Date("2026-09-20T09:30"),
      frequency: null,
      selectionStrategy: null,
      shuffleDeck: false,
    }),
  );
  expect(mocks.push).toHaveBeenCalledWith("/schedule/schedule-1?saved=created");
});

it("updates a recurring schedule without discarding recurrence fields", async () => {
  mocks.row = {
    id: "schedule-2",
    name: "Recurring",
    type: "RECURRING",
    targetGroupId: "group-1",
    targetTimezone: "UTC",
    startsAt: new Date("2026-09-20T09:30:00Z"),
    frequency: "WEEKLY",
    localTimeMinutes: 570,
    weekday: 2,
    dayOfMonth: null,
    month: null,
    selectionStrategy: "DECK",
    shuffleDeck: true,
    deliveryMode: "BLAST",
    dripEmailsPerMinute: null,
    batchSize: null,
    batchIntervalMinutes: null,
    maxCampaigns: 12,
    endsAt: new Date("2027-01-01T00:00:00Z"),
    autoCompleteAfterDays: 20,
    sources: [{ campaignId: "campaign-1" }],
  };
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="en">
      <ScheduleFormContainer scheduleId="schedule-2" />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(mocks.update).toHaveBeenCalledWith({
    id: "schedule-2",
    data: expect.objectContaining({
      frequency: "WEEKLY",
      localTimeMinutes: 570,
      weekday: 2,
      selectionStrategy: "DECK",
      shuffleDeck: true,
      maxCampaigns: 12,
    }),
  });
});
