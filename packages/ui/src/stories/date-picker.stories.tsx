import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker, DateTimePicker, FormField } from "../index";

function CalendarExample({
  locale = "en",
  withTime = false,
}: {
  locale?: "en" | "bg";
  withTime?: boolean;
}) {
  const [value, setValue] = useState(
    withTime ? "2026-09-20T14:30" : "2026-09-20",
  );
  const Picker = withTime ? DateTimePicker : DatePicker;
  return (
    <div className="np-theme max-w-sm p-5">
      <FormField
        label={locale === "bg" ? "Дата на изпращане" : "Delivery date"}
      >
        {(field) => (
          <Picker
            {...field}
            value={value}
            onValueChange={setValue}
            locale={locale}
          />
        )}
      </FormField>
      <output className="mt-4 block text-sm">{value}</output>
    </div>
  );
}
const meta = {
  title: "Molecules/DatePicker",
  component: CalendarExample,
} satisfies Meta<typeof CalendarExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DateOnly: Story = {};
export const DateAndTime: Story = { args: { withTime: true } };
export const Bulgarian: Story = { args: { locale: "bg", withTime: true } };
