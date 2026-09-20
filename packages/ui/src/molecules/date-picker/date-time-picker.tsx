"use client";

import { TimePicker } from "./time-picker";
import { clampTime } from "./date-values";
import { DatePicker, type DatePickerProps } from "./date-picker";

export type DateTimePickerProps = DatePickerProps;

/** Keeps the same local YYYY-MM-DDTHH:mm contract as datetime-local. */
export function DateTimePicker({
  value,
  onValueChange,
  locale = "en",
  min,
  max,
  name,
  ...props
}: DateTimePickerProps) {
  const [date = "", time = ""] = value.split("T");
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_10rem] gap-2 max-[480px]:grid-cols-1">
      <DatePicker
        {...props}
        locale={locale}
        value={date}
        min={min?.split("T")[0]}
        max={max?.split("T")[0]}
        onValueChange={(next) =>
          onValueChange(
            next
              ? `${next}T${clampTime(time || "00:00", min?.split("T")[0] === next ? min.split("T")[1] : undefined, max?.split("T")[0] === next ? max.split("T")[1] : undefined)}`
              : "",
          )
        }
      />
      <TimePicker
        locale={locale}
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        disabled={props.disabled || !date}
        required={props.required}
        value={time}
        min={min?.split("T")[0] === date ? min.split("T")[1] : undefined}
        max={max?.split("T")[0] === date ? max.split("T")[1] : undefined}
        onBlur={props.onBlur}
        onValueChange={(nextTime) => onValueChange(`${date}T${nextTime}`)}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={props.disabled}
        />
      )}
    </div>
  );
}
