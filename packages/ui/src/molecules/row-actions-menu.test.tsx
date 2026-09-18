import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RowActionsMenu } from "./row-actions-menu";

it("opens a portaled action menu and invokes the selected action", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  const { container } = render(
    <RowActionsMenu label="Actions" items={[{ label: "Edit", onSelect }]} />,
  );

  await user.click(screen.getByRole("button", { name: "Actions" }));
  const item = screen.getByRole("menuitem", { name: "Edit" });
  expect(container.contains(item)).toBe(false);
  await user.click(item);
  expect(onSelect).toHaveBeenCalledOnce();
});
