"use client";
import { useId, useState, type ComponentProps } from "react";
import { Popover } from "radix-ui";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "../atoms/checkbox";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import type { SelectOption } from "../atoms/select";
import { SkeletonList } from "../atoms/skeleton";
export interface MultiSelectProps extends Pick<
  ComponentProps<"button">,
  | "id"
  | "disabled"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-invalid"
  | "onBlur"
> {
  options: SelectOption[];
  loading?: boolean;
  loadingLabel?: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  labels?: {
    search: string;
    empty: string;
    selected: (count: number) => string;
    remove: (label: string) => string;
    clear: string;
    done: string;
    options: string;
  };
}
const defaultLabels = {
  search: "Search options",
  empty: "No options found",
  selected: (count: number) => `${count} selected`,
  remove: (label: string) => `Remove ${label}`,
  clear: "Clear selection",
  done: "Done",
  options: "Select options",
};
/** Searchable checkbox group: each option uses native checkbox keyboard semantics. */
export function MultiSelect({
  options,
  loading = false,
  loadingLabel,
  value,
  onValueChange,
  name,
  required,
  placeholder = "Select options…",
  labels = defaultLabels,
  ...props
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const id = useId();
  const byValue = new Map(options.map((option) => [option.value, option]));
  const selectedValues = new Set(value);
  const visible = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  function toggle(key: string) {
    onValueChange(
      selectedValues.has(key)
        ? value.filter((v) => v !== key)
        : [...value, key],
    );
  }
  return (
    <div className="np-multiselect">
      <Popover.Root
        onOpenChange={(open) => {
          if (!open) setQuery("");
        }}
      >
        <Popover.Trigger
          {...props}
          type="button"
          aria-required={required || undefined}
          className="np-input np-select-trigger"
        >
          <span>
            {value.length ? labels.selected(value.length) : placeholder}
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Portal>
          <div className="np-theme">
            <Popover.Content
              className="np-option-popover"
              align="start"
              sideOffset={5}
              aria-label={labels.options}
            >
              <div className="np-options-search">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={labels.search}
                  aria-label={labels.search}
                />
              </div>
              <fieldset
                className="np-multi-options"
                aria-busy={loading || undefined}
              >
                <legend className="np-sr-only">{labels.options}</legend>
                {loading ? (
                  <SkeletonList label={loadingLabel} />
                ) : visible.length ? (
                  visible.map((option) => (
                    <label
                      key={option.value}
                      className="np-multi-option"
                      htmlFor={`${id}-${option.value}`}
                    >
                      <Checkbox
                        id={`${id}-${option.value}`}
                        checked={selectedValues.has(option.value)}
                        disabled={option.disabled}
                        onCheckedChange={() => toggle(option.value)}
                      />
                      {option.label}
                    </label>
                  ))
                ) : (
                  <p className="np-options-message" role="status">
                    {labels.empty}
                  </p>
                )}
              </fieldset>
              <div className="np-options-footer">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!value.some((key) => !byValue.get(key)?.disabled)}
                  onClick={() =>
                    onValueChange(
                      value.filter((key) => byValue.get(key)?.disabled),
                    )
                  }
                >
                  {labels.clear}
                </Button>
                <Popover.Close asChild>
                  <Button size="sm">{labels.done}</Button>
                </Popover.Close>
              </div>
            </Popover.Content>
          </div>
        </Popover.Portal>
      </Popover.Root>
      {value.length > 0 && (
        <ul
          className="np-selected-tags"
          aria-label={labels.selected(value.length)}
        >
          {value.map((key) => {
            const option = byValue.get(key);
            return (
              <li key={key}>
                <span>{option?.label ?? key}</span>
                <button
                  type="button"
                  disabled={props.disabled || option?.disabled}
                  aria-label={labels.remove(option?.label ?? key)}
                  onClick={() => toggle(key)}
                >
                  <X size={13} aria-hidden="true" />
                </button>
                {name && (
                  <input
                    type="hidden"
                    name={name}
                    value={key}
                    disabled={props.disabled}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
