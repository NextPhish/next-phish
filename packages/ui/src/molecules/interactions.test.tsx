import { useState } from "react";
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Button,
  Dialog,
  FormField,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AppShell,
} from "../index";
it("associates field hints and errors with the control", () => {
  render(
    <FormField label="Name" hint="Internal name" error="Required">
      {(props) => <Input {...props} />}
    </FormField>,
  );
  const input = screen.getByLabelText("Name");
  expect(input).toHaveAccessibleDescription("Internal name Required");
  expect(input).toHaveAttribute("aria-invalid", "true");
});
it("closes a Radix dialog with Escape and restores trigger focus", async () => {
  const user = userEvent.setup();
  render(
    <Dialog
      title="Details"
      description="Campaign details"
      trigger={<Button>Open details</Button>}
    >
      <Button>Inside dialog</Button>
    </Dialog>,
  );
  const trigger = screen.getByRole("button", { name: "Open details" });
  await user.click(trigger);
  expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it("moves between tabs with the keyboard", async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="one">
      <TabsList aria-label="Settings">
        <TabsTrigger value="one">General</TabsTrigger>
        <TabsTrigger value="two">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="one">General content</TabsContent>
      <TabsContent value="two">Security content</TabsContent>
    </Tabs>,
  );
  screen.getByRole("tab", { name: "General" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Security content");
});
it("opens and dismisses responsive navigation", async () => {
  const user = userEvent.setup();
  render(
    <AppShell
      navigation={[
        {
          id: "main",
          items: [{ id: "home", label: "Overview", href: "#overview" }],
        },
      ]}
      activeItem="home"
      breadcrumb="Overview"
    >
      <h1>Overview</h1>
    </AppShell>,
  );
  const trigger = screen.getByRole("button", { name: "Open navigation" });
  await user.click(trigger);
  expect(
    screen.getByRole("dialog", { name: "Main navigation" }),
  ).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});

function OneTimeSecretDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Reveal key</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        dismissible={false}
        title="Copy your key"
        description="Shown only once"
      >
        <Button onClick={() => setOpen(false)}>Done</Button>
      </Dialog>
    </>
  );
}

it("protects one-time content from Escape and restores the external opener after Done", async () => {
  const user = userEvent.setup();
  render(<OneTimeSecretDialog />);
  const opener = screen.getByRole("button", { name: "Reveal key" });
  await user.click(opener);
  expect(
    screen.queryByRole("button", { name: "Close dialog" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(
    screen.getByRole("dialog", { name: "Copy your key" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
});
