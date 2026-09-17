import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { HelpTooltip } from "./help-tooltip";

it("exposes help on hover and keyboard focus, and closes with Escape", async () => {
  const user = userEvent.setup();
  render(
    <HelpTooltip label="About page types">
      Landing displays content; redirect opens a destination.
    </HelpTooltip>,
  );
  const trigger = screen.getByRole("button", { name: "About page types" });
  await user.hover(trigger);
  expect(await screen.findByRole("tooltip")).toHaveTextContent(
    "Landing displays content",
  );
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  await user.unhover(trigger);
  await user.tab();
  expect(await screen.findByRole("tooltip")).toHaveTextContent(
    "redirect opens a destination",
  );
});
