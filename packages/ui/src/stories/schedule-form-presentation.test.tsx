import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import type { ScheduleFormValues } from "@next-phish/shared";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { createTranslator } from "../../../../apps/next-app/src/lib/i18n";
import { ScheduleFormPresentation } from "../../../../apps/next-app/src/components/organisms/schedules/form-presentation";
import { scheduleFormValidator } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-form-validation";

const values: ScheduleFormValues = {
  name: "",
  type: "ONE_TIME",
  sourceCampaignIds: [],
  targetGroupId: null,
  targetTimezone: "UTC",
  startsAt: "",
  frequency: null,
  localTimeMinutes: null,
  weekday: null,
  dayOfMonth: null,
  month: null,
  selectionStrategy: null,
  shuffleDeck: false,
  deliveryMode: "BLAST",
  dripEmailsPerMinute: null,
  batchSize: null,
  batchIntervalMinutes: null,
  maxCampaigns: null,
  endsAt: null,
  autoCompleteAfterDays: 20,
};
const campaigns = [
  { id: "campaign-1", name: "Кампания", type: "CONCRETE" as const },
];
it("shows Bulgarian validation and focuses controls from the error summary", async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider initialLocale="bg">
      <Formik
        initialValues={values}
        validate={scheduleFormValidator(createTranslator("bg"), campaigns)}
        onSubmit={() => undefined}
      >
        <ScheduleFormPresentation
          error=""
          campaigns={campaigns}
          targetGroups={[]}
          onCancel={() => undefined}
        />
      </Formik>
    </I18nProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Запазване на графика" }),
  );
  const sourceError = await screen.findByRole("link", {
    name: "Изберете кампания източник",
  });
  await user.click(sourceError);
  expect(document.getElementById("schedule-sourceCampaignIds")).toHaveFocus();
  await user.click(
    screen.getByRole("link", { name: "Началният час е задължителен" }),
  );
  expect(document.getElementById("schedule-startsAt")).toHaveFocus();
});
