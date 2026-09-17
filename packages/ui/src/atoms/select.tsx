"use client";
import type { ComponentProps } from "react";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../utils";
import { SkeletonList } from "./skeleton";
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends ComponentProps<typeof Primitive.Root> {
  options: SelectOption[];
  loading?: boolean;
  loadingLabel?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  onBlur?: ComponentProps<typeof Primitive.Trigger>["onBlur"];
}
export function Select({
  options,
  loading = false,
  loadingLabel,
  placeholder = "Choose an option",
  id,
  className,
  onBlur,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: SelectProps) {
  return (
    <Primitive.Root {...props}>
      <Primitive.Trigger
        id={id}
        onBlur={onBlur}
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={cn("np-input np-select-trigger", className)}
      >
        <Primitive.Value placeholder={placeholder} />
        <Primitive.Icon>
          <ChevronDown size={16} aria-hidden="true" />
        </Primitive.Icon>
      </Primitive.Trigger>
      <Primitive.Portal>
        <div className="np-theme">
          <Primitive.Content
            className="np-select-content"
            position="popper"
            sideOffset={5}
          >
            <Primitive.ScrollUpButton className="np-select-scroll">
              <ChevronUp size={16} />
            </Primitive.ScrollUpButton>
            <Primitive.Viewport>
              {loading ? (
                <SkeletonList label={loadingLabel} />
              ) : (
                options.map((option) => (
                  <Primitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="np-select-option"
                  >
                    <Primitive.ItemText>{option.label}</Primitive.ItemText>
                    <Primitive.ItemIndicator>
                      <Check size={15} aria-hidden="true" />
                    </Primitive.ItemIndicator>
                  </Primitive.Item>
                ))
              )}
            </Primitive.Viewport>
            <Primitive.ScrollDownButton className="np-select-scroll">
              <ChevronDown size={16} />
            </Primitive.ScrollDownButton>
          </Primitive.Content>
        </div>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
