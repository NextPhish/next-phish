"use client";
import { useId } from "react";
import { DropdownMenu } from "radix-ui";
import { Plus, X } from "lucide-react";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { Select, type SelectOption } from "../atoms/select";
export type TableFilter =
  | { field: string; label: string; type: "text" | "date" | "numeric" }
  | { field: string; label: string; type: "select"; options: SelectOption[] };
export type FilterValues = Record<string, string | number>;
export interface FilterBarProps {
  filters: TableFilter[];
  values: FilterValues;
  onChange: (field: string, value: string | number) => void;
  onRemove: (field: string) => void;
  onClear: () => void;
  clearLabel?: string;
  addLabel?: string;
  placeholder?: string;
  removeLabel?: (label: string) => string;
}
export function FilterBar({
  filters,
  values,
  onChange,
  onRemove,
  onClear,
  clearLabel = "Clear filters",
  addLabel = "Add filter",
  placeholder = "Choose…",
  removeLabel = (label) => `Remove ${label} filter`,
}: FilterBarProps) {
  const id = useId();
  const active = filters.filter((filter) =>
    Object.hasOwn(values, filter.field),
  );
  const available = filters.filter(
    (filter) => !Object.hasOwn(values, filter.field),
  );
  return (
    <div className="np-filter-builder">
      <div className="np-filter-builder-actions">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" size="sm" disabled={!available.length}>
              <Plus size={14} aria-hidden="true" />
              {addLabel}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <div className="np-theme">
              <DropdownMenu.Content
                className="np-filter-menu"
                align="start"
                sideOffset={5}
              >
                {available.map((filter) => (
                  <DropdownMenu.Item
                    key={filter.field}
                    className="np-select-option"
                    onSelect={() => onChange(filter.field, "")}
                  >
                    {filter.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </div>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {active.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
        )}
      </div>
      {active.length > 0 && (
        <div className="np-active-filters">
          {active.map((filter) => (
            <div className="np-filter-token" key={filter.field}>
              <label htmlFor={`${id}-${filter.field}`}>{filter.label}</label>
              {filter.type === "select" ? (
                <Select
                  id={`${id}-${filter.field}`}
                  options={filter.options}
                  value={String(values[filter.field] ?? "")}
                  placeholder={placeholder}
                  onValueChange={(value) => onChange(filter.field, value)}
                />
              ) : (
                <Input
                  id={`${id}-${filter.field}`}
                  type={filter.type === "numeric" ? "number" : filter.type}
                  value={values[filter.field] ?? ""}
                  onChange={(event) =>
                    onChange(
                      filter.field,
                      filter.type === "numeric" && event.target.value !== ""
                        ? Number(event.target.value)
                        : event.target.value,
                    )
                  }
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                aria-label={removeLabel(filter.label)}
                onClick={() => onRemove(filter.field)}
              >
                <X size={14} aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
