"use client";

import { useId, useState, type AriaAttributes } from "react";
import { Popover } from "radix-ui";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./calendar";
import { cn } from "../../utils";
import { Button } from "../../atoms/button";
import { formatLocalDate, parseLocalDate } from "./date-values";

export interface DatePickerProps extends AriaAttributes {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  locale?: "en" | "bg";
  disabled?: boolean;
  /** Prevents clearing; required-date validation belongs to the owning form schema. */
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
}

export function DatePicker({
  id,
  name,
  value,
  onValueChange,
  onBlur,
  locale = "en",
  disabled,
  required,
  placeholder,
  min,
  max,
  className,
  ...aria
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const selected = parseLocalDate(value);
  const minimum = min ? parseLocalDate(min) : undefined;
  const maximum = max ? parseLocalDate(max) : undefined;
  const label = locale === "bg" ? "Избор на дата" : "Choose date";
  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) onBlur?.();
      }}
    >
      <Popover.Trigger asChild>
        <button
          {...aria}
          id={id ?? generatedId}
          type="button"
          disabled={disabled}
          onBlur={() => {
            if (!open) onBlur?.();
          }}
          className={cn(
            "np-input flex w-full items-center justify-between gap-2 text-left",
            className,
          )}
        >
          <span>
            {selected
              ? selected.toLocaleDateString(locale === "bg" ? "bg-BG" : "en-GB")
              : (placeholder ?? label)}
          </span>
          <CalendarDays size={16} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}
      <Popover.Portal>
        <Popover.Content
          className="np-theme np-date-picker-popover"
          aria-label={label}
          sideOffset={6}
          collisionPadding={12}
          align="start"
        >
          <Calendar
            language={locale}
            mode="single"
            required={required}
            selected={selected}
            defaultMonth={selected}
            autoFocus
            disabled={[
              ...(minimum ? [{ before: minimum }] : []),
              ...(maximum ? [{ after: maximum }] : []),
            ]}
            onSelect={(date: Date | undefined) => {
              onValueChange(date ? formatLocalDate(date) : "");
              setOpen(false);
              onBlur?.();
            }}
          />
          {!required && value && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onValueChange("");
                setOpen(false);
                onBlur?.();
              }}
            >
              {locale === "bg" ? "Изчисти" : "Clear"}
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
