import type { Meta, StoryObj } from "@storybook/react-vite";
import { Formik } from "formik";
import type { ScheduleFormValues } from "@next-phish/shared";
import {
  I18nProvider,
  useTranslation,
} from "../../../../apps/next-app/src/lib/i18n/client";
import { ScheduleFormPresentation } from "../../../../apps/next-app/src/components/organisms/schedules/form-presentation";
import { scheduleFormValidator } from "../../../../apps/next-app/src/components/organisms/schedules/schedule-form-validation";

const defaults: ScheduleFormValues = {
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
const recurring: ScheduleFormValues = {
  ...defaults,
  name: "Quarterly awareness",
  type: "RECURRING",
  sourceCampaignIds: ["template-1", "template-2"],
  targetGroupId: "group-1",
  startsAt: "2026-10-01T09:00",
  frequency: "QUARTERLY",
  localTimeMinutes: 540,
  dayOfMonth: 1,
  selectionStrategy: "DECK",
  shuffleDeck: true,
  deliveryMode: "DRIP",
  dripEmailsPerMinute: 60,
  maxCampaigns: 8,
};
const campaigns = [
  { id: "campaign-1", name: "September simulation", type: "CONCRETE" as const },
  { id: "template-1", name: "Credential awareness", type: "TEMPLATE" as const },
  { id: "template-2", name: "Invoice awareness", type: "TEMPLATE" as const },
];
const groups = [{ id: "group-1", name: "All staff", userCount: 840 }];

function Fixture({
  values,
  locale = "en",
}: {
  values: ScheduleFormValues;
  locale?: "en" | "bg";
}) {
  return (
    <I18nProvider initialLocale={locale}>
      <LocalizedFixture values={values} />
    </I18nProvider>
  );
}
function LocalizedFixture({ values }: { values: ScheduleFormValues }) {
  const t = useTranslation();
  return (
    <div className="np-theme" style={{ maxWidth: 1040, margin: "2rem auto" }}>
      <Formik
        initialValues={values}
        validate={scheduleFormValidator(t, campaigns)}
        onSubmit={() => undefined}
      >
        <ScheduleFormPresentation
          error=""
          campaigns={campaigns}
          targetGroups={groups}
          onCancel={() => undefined}
        />
      </Formik>
    </div>
  );
}
const meta = {
  title: "Application/Schedule form",
  component: Fixture,
} satisfies Meta<typeof Fixture>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { values: defaults } };
export const Recurring: Story = { args: { values: recurring } };
export const BulgarianValidation: Story = {
  args: { values: defaults, locale: "bg" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Запазване на графика" }),
    );
  },
};
