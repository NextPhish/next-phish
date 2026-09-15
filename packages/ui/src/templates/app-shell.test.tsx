import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./app-shell";

it("closes navigation after a route change without remounting page content", async () => {
  const user = userEvent.setup();
  const navigation = [
    { id: "main", items: [{ id: "home", label: "Home", href: "/" }] },
  ];
  const view = (navigationKey: string) => (
    <AppShell
      navigation={navigation}
      activeItem="home"
      breadcrumb="Home"
      navigationKey={navigationKey}
    >
      <input aria-label="Unsaved note" defaultValue="" />
    </AppShell>
  );
  const { rerender } = render(view("/"));
  await user.type(
    screen.getByRole("textbox", { name: "Unsaved note" }),
    "Keep my draft",
  );
  await user.click(screen.getByRole("button", { name: "Open navigation" }));
  expect(
    screen.getByRole("dialog", { name: "Main navigation" }),
  ).toBeInTheDocument();
  rerender(view("/campaigns"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Unsaved note" })).toHaveValue(
    "Keep my draft",
  );
});
