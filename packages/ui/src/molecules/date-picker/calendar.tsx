"use client";

import type { ChangeEvent } from "react";
import { Select } from "../../atoms/select";
import {
  DayPicker,
  type DayPickerProps,
  type DropdownProps,
} from "@daypicker/react";
import { bg, enUS } from "@daypicker/react/locale";

export type CalendarProps = DayPickerProps & { language?: "en" | "bg" };

function CalendarDropdown({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": label,
}: DropdownProps) {
  return (
    <Select
      aria-label={label}
      disabled={disabled}
      value={String(value ?? "")}
      options={options.map((option) => ({
        ...option,
        value: String(option.value),
      }))}
      className="h-9 min-w-0 px-2 text-sm"
      onValueChange={(next) => {
        // DayPicker's dropdown adapter reads target.value, like its native select.
        onChange?.({
          target: { value: next },
          currentTarget: { value: next },
        } as ChangeEvent<HTMLSelectElement>);
      }}
    />
  );
}

/** Shared DayPicker skin; callers retain selection and date constraints. */
export function Calendar({ language = "en", ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={language === "bg" ? bg : enUS}
      weekStartsOn={1}
      captionLayout="dropdown"
      navLayout="after"
      startMonth={new Date(1900, 0, 1)}
      endMonth={new Date(2100, 11, 31)}
      components={{ Dropdown: CalendarDropdown }}
      labels={
        language === "bg"
          ? {
              labelNext: () => "Следващ месец",
              labelPrevious: () => "Предишен месец",
              labelDayButton: (date, modifiers) =>
                `${date.toLocaleDateString("bg-BG", { dateStyle: "full" })}${modifiers.today ? ", днес" : ""}${modifiers.selected ? ", избрана" : ""}`,
              labelMonthDropdown: () => "Месец",
              labelYearDropdown: () => "Година",
            }
          : undefined
      }
      {...props}
      className={["np-calendar", props.className].filter(Boolean).join(" ")}
    />
  );
}
