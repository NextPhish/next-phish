import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { HelpPopover } from "../index";

it("opens help with the keyboard and restores focus on Escape", async () => {
  const user = userEvent.setup();
  render(
    <HelpPopover label="Pending publications">
      Jobs waiting for the queue.
    </HelpPopover>,
  );
  const trigger = screen.getByRole("button", { name: "Pending publications" });
  await user.tab();
  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("dialog", { name: "Pending publications" }),
  ).toHaveTextContent("Jobs waiting for the queue.");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
