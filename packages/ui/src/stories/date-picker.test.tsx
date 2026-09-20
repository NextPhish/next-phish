import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, DateTimePicker, FilterBar } from "../index";
import {
  formatLocalDate,
  parseLocalDate,
} from "../molecules/date-picker/date-values";

describe("local date values", () => {
  it("rejects rolled-over dates and preserves local calendar days", () => {
    expect(parseLocalDate("2026-02-30")).toBeUndefined();
    expect(parseLocalDate("2026-13-01")).toBeUndefined();
    expect(formatLocalDate(parseLocalDate("2024-02-29")!)).toBe("2024-02-29");
    expect(formatLocalDate(parseLocalDate("2026-10-25")!)).toBe("2026-10-25");
  });
});

it("opens with keyboard, selects a day, and restores focus", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <DatePicker
      aria-label="Delivery date"
      value="2026-09-20"
      onValueChange={onChange}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Delivery date" });
  await user.tab();
  await user.keyboard("{Enter}");
  await user.click(
    screen.getByRole("button", { name: /September 21st, 2026/ }),
  );
  expect(onChange).toHaveBeenCalledWith("2026-09-21");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it("preserves time when changing the calendar day and clears the complete value", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState("2026-09-20T14:30");
    return (
      <>
        <DateTimePicker
          aria-label="Delivery date"
          value={value}
          onValueChange={setValue}
        />
        <output>{value}</output>
      </>
    );
  }
  render(<Example />);
  await user.click(screen.getByRole("button", { name: "Delivery date" }));
  await user.click(
    screen.getByRole("button", { name: /September 21st, 2026/ }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("2026-09-21T14:30");
  await user.click(screen.getByRole("button", { name: "Time" }));
  await user.click(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "16",
      selected: false,
    }),
  );
  await user.click(
    within(screen.getByRole("listbox", { name: "Minutes" })).getByRole(
      "option",
      { name: "45", selected: false },
    ),
  );
  expect(screen.getByRole("status")).toHaveTextContent("2026-09-21T14:30");
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(screen.getByRole("status")).toHaveTextContent("2026-09-21T16:45");
  await user.click(screen.getByRole("button", { name: "Delivery date" }));
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

it("localizes navigation and prevents disabled and out-of-range selection", async () => {
  const user = userEvent.setup();
  render(
    <DatePicker
      aria-label="Дата"
      locale="bg"
      value="2026-09-20"
      min="2026-09-20"
      max="2026-09-22"
      onValueChange={vi.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Дата" }));
  expect(
    screen.getByRole("button", { name: "Следващ месец" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /19 септември/ })).toBeDisabled();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Дата" })).toHaveFocus();
});

it("uses DayPicker for table date filters and returns date-only values", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <FilterBar
      filters={[{ field: "created", label: "Created on", type: "date" }]}
      values={{ created: "2026-09-20" }}
      onChange={onChange}
      onRemove={vi.fn()}
      onClear={vi.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Created on" }));
  await user.click(
    screen.getByRole("button", { name: /September 21st, 2026/ }),
  );
  expect(onChange).toHaveBeenCalledWith("created", "2026-09-21");
});

it("does not mark the field touched while opening its calendar", async () => {
  const user = userEvent.setup();
  const onBlur = vi.fn();
  render(
    <DatePicker
      aria-label="Date"
      value="2026-09-20"
      onValueChange={vi.fn()}
      onBlur={onBlur}
      required
    />,
  );
  await user.click(screen.getByRole("button", { name: "Date" }));
  expect(onBlur).not.toHaveBeenCalled();
  expect(
    screen.queryByRole("button", { name: "Clear" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(onBlur).toHaveBeenCalled();
});

it("jumps directly to a selected month and year with themed dropdowns", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <DatePicker
      aria-label="Date"
      value="2026-09-20"
      onValueChange={onChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Date" }));
  await user.click(screen.getByRole("combobox", { name: "Choose the Year" }));
  await user.click(screen.getByRole("option", { name: "2030" }));
  await user.click(screen.getByRole("combobox", { name: "Choose the Month" }));
  await user.click(screen.getByRole("option", { name: "January" }));
  await user.click(screen.getByRole("button", { name: /January 15th, 2030/ }));
  expect(onChange).toHaveBeenCalledWith("2030-01-15");
});

it("clamps boundary-day time and excludes hours outside the allowed range", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState("2026-09-21T08:15");
    return (
      <>
        <DateTimePicker
          aria-label="Date"
          value={value}
          onValueChange={setValue}
          min="2026-09-20T09:30"
        />
        <output>{value}</output>
      </>
    );
  }
  render(<Example />);
  await user.click(screen.getByRole("button", { name: "Date" }));
  await user.click(
    screen.getByRole("button", { name: /September 20th, 2026/ }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("2026-09-20T09:30");
  await user.click(screen.getByRole("button", { name: "Time" }));
  expect(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "08",
      selected: false,
    }),
  ).toBeDisabled();
});

it("discards draft time on Cancel and Escape, then restores focus", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const onBlur = vi.fn();
  render(
    <DateTimePicker
      aria-label="Date"
      value="2026-09-20T14:30"
      onValueChange={onChange}
      onBlur={onBlur}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Time" });
  await user.click(trigger);
  expect(onBlur).not.toHaveBeenCalled();
  const hours = within(screen.getByRole("listbox", { name: "Hours" }));
  expect(
    hours.getByRole("option", { name: "14", selected: true }),
  ).toHaveFocus();
  await user.keyboard("{End}");
  expect(hours.getByRole("option", { name: "23" })).toHaveFocus();
  await user.keyboard("{Home}");
  expect(hours.getByRole("option", { name: "00" })).toHaveFocus();
  await user.click(
    hours.getByRole("option", {
      name: "16",
      selected: false,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onChange).not.toHaveBeenCalled();
  expect(onBlur).toHaveBeenCalledTimes(1);
  expect(trigger).toHaveFocus();

  await user.click(trigger);
  expect(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "14",
      selected: true,
    }),
  ).toBeInTheDocument();
  await user.click(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "17",
      selected: false,
    }),
  );
  await user.keyboard("{Escape}");
  expect(onChange).not.toHaveBeenCalled();
  expect(onBlur).toHaveBeenCalledTimes(2);
  expect(trigger).toHaveFocus();
});

it("commits an in-range boundary time only after OK", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <DateTimePicker
      aria-label="Date"
      value="2026-09-20T10:00"
      min="2026-09-20T09:30"
      max="2026-09-20T10:15"
      onValueChange={onChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Time" }));
  expect(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "08",
      selected: false,
    }),
  ).toBeDisabled();
  await user.click(
    within(screen.getByRole("listbox", { name: "Hours" })).getByRole("option", {
      name: "09",
      selected: false,
    }),
  );
  expect(
    within(screen.getByRole("listbox", { name: "Minutes" })).getByRole(
      "option",
      { name: "29", selected: false },
    ),
  ).toBeDisabled();
  await user.click(
    within(screen.getByRole("listbox", { name: "Minutes" })).getByRole(
      "option",
      { name: "30", selected: true },
    ),
  );
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(onChange).toHaveBeenCalledWith("2026-09-20T09:30");
});
