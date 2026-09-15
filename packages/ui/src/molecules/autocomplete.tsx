"use client";
import { useId, useState, type ComponentProps } from "react";
import { useCombobox } from "downshift";
import { Check, Search } from "lucide-react";
import type { SelectOption } from "../atoms/select";
import { SkeletonList } from "../atoms/skeleton";
export interface AutocompleteProps extends Pick<
  ComponentProps<"input">,
  | "id"
  | "name"
  | "disabled"
  | "required"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
  | "aria-invalid"
  | "onBlur"
> {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  onSearchChange?: (query: string) => void;
  filterMode?: "client" | "server";
  placeholder?: string;
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  listLabel?: string;
}
export function Autocomplete({
  options,
  value,
  onValueChange,
  onSearchChange,
  filterMode = "client",
  placeholder = "Search options…",
  loading,
  loadingLabel = "Loading options…",
  emptyLabel = "No options found",
  listLabel = "Suggestions",
  name,
  id,
  ...props
}: AutocompleteProps) {
  const generated = useId();
  const [query, setQuery] = useState("");
  const items = loading
    ? []
    : filterMode === "server"
      ? options
      : options.filter((option) =>
          option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        );
  const {
    isOpen,
    highlightedIndex,
    getMenuProps,
    getInputProps,
    getItemProps,
    openMenu,
  } = useCombobox({
    id: generated,
    // Focusing opens the menu; the following pointer click must not toggle it shut.
    stateReducer: (_state, { type, changes }) =>
      type === useCombobox.stateChangeTypes.InputClick
        ? { ...changes, isOpen: true }
        : changes,
    inputId: id ?? `${generated}-input`,
    items,
    selectedItem: options.find((option) => option.value === value) ?? null,
    itemToString: (option) => option?.label ?? "",
    isItemDisabled: (option) => Boolean(option.disabled),
    onInputValueChange: ({ inputValue, type }) => {
      setQuery(inputValue);
      if (type === useCombobox.stateChangeTypes.InputChange)
        onSearchChange?.(inputValue);
    },
    onSelectedItemChange: ({ selectedItem }) =>
      onValueChange(selectedItem?.value ?? ""),
  });
  return (
    <div className="np-autocomplete">
      <div className="np-search">
        <Search size={16} aria-hidden="true" />
        <input
          className="np-input"
          {...getInputProps({
            ...props,
            placeholder,
            "aria-labelledby": props["aria-labelledby"],
            onFocus: () => {
              if (!props.disabled) openMenu();
            },
          })}
        />
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={props.disabled}
        />
      )}
      <ul
        {...getMenuProps({
          "aria-label": listLabel,
          "aria-labelledby": undefined,
          "aria-busy": loading || undefined,
        })}
        className="np-autocomplete-list"
        hidden={!isOpen || props.disabled}
      >
        {isOpen &&
          !props.disabled &&
          items.map((option, index) => (
            <li
              {...getItemProps({ item: option, index })}
              key={option.value}
              className="np-select-option"
              data-highlighted={highlightedIndex === index ? "" : undefined}
              data-disabled={option.disabled ? "" : undefined}
            >
              {option.label}
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </li>
          ))}
      </ul>
      {isOpen && !props.disabled && (loading || !items.length) && (
        <div className="np-autocomplete-message">
          {loading ? (
            <SkeletonList label={loadingLabel} />
          ) : (
            <span role="status">{emptyLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
