import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  FormField,
  Select,
  Autocomplete,
  MultiSelect,
  type SelectOption,
} from "../index";
const options: SelectOption[] = [
  { value: "engineering", label: "Engineering" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "people", label: "People team" },
  { value: "archived", label: "Archived group", disabled: true },
];
function SelectionDemo({
  kind = "select",
  disabled = false,
  invalid = false,
  loading = false,
  empty = false,
}: {
  kind?: "select" | "autocomplete" | "multi";
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
  empty?: boolean;
}) {
  const [value, setValue] = useState("");
  const [values, setValues] = useState<string[]>(["engineering"]);
  const list = empty ? [] : options;
  return (
    <div style={{ maxWidth: 420 }}>
      <FormField
        label="Target groups"
        hint="Choose the audience for your simulation."
        error={invalid ? "Select at least one group." : undefined}
      >
        {(props) =>
          kind === "multi" ? (
            <MultiSelect
              {...props}
              options={list}
              value={values}
              loading={loading}
              onValueChange={setValues}
              disabled={disabled}
            />
          ) : kind === "autocomplete" ? (
            <Autocomplete
              {...props}
              options={list}
              value={value}
              onValueChange={setValue}
              disabled={disabled}
              loading={loading}
            />
          ) : (
            <Select
              {...props}
              loading={loading}
              options={list}
              value={value}
              onValueChange={setValue}
              disabled={disabled}
            />
          )
        }
      </FormField>
      <p className="text-ui-muted text-xs mt-4">
        Selected:{" "}
        {kind === "multi" ? values.join(", ") || "none" : value || "none"}
      </p>
    </div>
  );
}
const meta = {
  title: "Molecules/Selection controls",
  component: SelectionDemo,
} satisfies Meta<typeof SelectionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SingleSelect: Story = {};
export const SelectLoading: Story = { args: { loading: true } };
export const MultiSelectLoading: Story = {
  args: { kind: "multi", loading: true },
};
export const AutocompleteSearch: Story = { args: { kind: "autocomplete" } };
export const AutocompleteLoading: Story = {
  args: { kind: "autocomplete", loading: true },
};
export const AutocompleteEmpty: Story = {
  args: { kind: "autocomplete", empty: true },
};
export const MultipleSelection: Story = { args: { kind: "multi" } };
export const MultiSelectEmpty: Story = { args: { kind: "multi", empty: true } };
export const DisabledSelect: Story = { args: { disabled: true } };
export const DisabledAutocomplete: Story = {
  args: { kind: "autocomplete", disabled: true },
};
export const DisabledMultiSelect: Story = {
  args: { kind: "multi", disabled: true },
};
export const InvalidSelect: Story = { args: { invalid: true } };
export const InvalidAutocomplete: Story = {
  args: { kind: "autocomplete", invalid: true },
};
export const InvalidMultiSelect: Story = {
  args: { kind: "multi", invalid: true },
};
