"use client";

import {
  useId,
  useState,
  type AriaAttributes,
  type KeyboardEvent,
} from "react";
import { Clock3 } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "../../atoms/button";
import { cn } from "../../utils";
import { clampTime } from "./date-values";

export interface TimePickerProps extends AriaAttributes {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  locale?: "en" | "bg";
  disabled?: boolean;
  required?: boolean;
  onBlur?: () => void;
  min?: string;
  max?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

function isInRange(time: string, min?: string, max?: string) {
  return (!min || time >= min) && (!max || time <= max);
}

function moveOptionFocus(event: KeyboardEvent<HTMLButtonElement>) {
  if (
    event.key !== "ArrowDown" &&
    event.key !== "ArrowUp" &&
    event.key !== "Home" &&
    event.key !== "End"
  ) {
    return;
  }
  event.preventDefault();
  const options = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      'button[role="option"]:not(:disabled)',
    ) ?? [],
  );
  if (event.key === "Home" || event.key === "End") {
    options[event.key === "Home" ? 0 : options.length - 1]?.focus();
    return;
  }
  const current = options.indexOf(event.currentTarget);
  const direction = event.key === "ArrowDown" ? 1 : -1;
  options[(current + direction + options.length) % options.length]?.focus();
}

/** A 24-hour picker that commits its draft value only when OK is pressed. */
export function TimePicker({
  id,
  value,
  onValueChange,
  locale = "en",
  disabled,
  required,
  onBlur,
  min,
  max,
  className,
  ...aria
}: TimePickerProps) {
  const generatedId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() =>
    clampTime(value || min || "00:00", min, max),
  );
  const [draftHour = "00", draftMinute = "00"] = draft.split(":");
  const copy =
    locale === "bg"
      ? {
          time: "Час",
          chooseTime: "Избор на час",
          hours: "Часове",
          minutes: "Минути",
          cancel: "Отказ",
        }
      : {
          time: "Time",
          chooseTime: "Choose time",
          hours: "Hours",
          minutes: "Minutes",
          cancel: "Cancel",
        };

  const setHour = (hour: string) => {
    const candidate = `${hour}:${draftMinute}`;
    const nextMinute = isInRange(candidate, min, max)
      ? draftMinute
      : MINUTES.find((minute) => isInRange(`${hour}:${minute}`, min, max));
    if (nextMinute) setDraft(`${hour}:${nextMinute}`);
  };
  const closePicker = () => {
    setOpen(false);
    onBlur?.();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(clampTime(value || min || "00:00", min, max));
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
          aria-label={aria["aria-label"] ?? copy.time}
          data-required={required || undefined}
          onBlur={() => {
            if (!open) onBlur?.();
          }}
          className={cn(
            "np-input flex w-full items-center justify-between gap-2 text-left tabular-nums",
            className,
          )}
        >
          <span>{value || "--:--"}</span>
          <Clock3 size={16} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label={copy.chooseTime}
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="np-theme np-date-picker-popover w-[min(20rem,calc(100vw-1.5rem))]"
        >
          <div className="grid grid-cols-2 gap-2">
            <TimeColumn
              label={copy.hours}
              values={HOURS}
              selected={draftHour}
              disabled={(hour) =>
                MINUTES.every(
                  (minute) => !isInRange(`${hour}:${minute}`, min, max),
                )
              }
              onSelect={setHour}
            />
            <TimeColumn
              label={copy.minutes}
              values={MINUTES}
              selected={draftMinute}
              disabled={(minute) =>
                !isInRange(`${draftHour}:${minute}`, min, max)
              }
              onSelect={(minute) => setDraft(`${draftHour}:${minute}`)}
            />
          </div>
          <div className="mt-3 flex justify-end gap-2 border-t border-[var(--np-border)] pt-3">
            <Button variant="ghost" onClick={closePicker}>
              {copy.cancel}
            </Button>
            <Button
              onClick={() => {
                onValueChange(draft);
                closePicker();
              }}
            >
              OK
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function TimeColumn({
  label,
  values,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  disabled: (value: string) => boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-center text-xs font-semibold text-[var(--np-muted)]">
        {label}
      </div>
      <div
        role="listbox"
        aria-label={label}
        className="h-56 overflow-y-auto rounded-lg border border-[var(--np-border)] p-1"
      >
        {values.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              ref={(node) => {
                if (node && isSelected) {
                  node.scrollIntoView?.({ block: "center" });
                }
              }}
              type="button"
              role="option"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={disabled(option)}
              onClick={() => onSelect(option)}
              onKeyDown={moveOptionFocus}
              className={cn(
                "mb-0.5 block w-full rounded-md border-0 bg-transparent px-3 py-2 text-center text-sm tabular-nums hover:bg-[var(--np-surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--np-primary)] disabled:cursor-not-allowed disabled:opacity-35",
                isSelected &&
                  "bg-[var(--np-primary)] font-semibold text-white hover:bg-[var(--np-primary)]",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
