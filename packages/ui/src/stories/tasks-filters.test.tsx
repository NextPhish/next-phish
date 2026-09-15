import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { TasksPresentation } from "../../../../apps/next-app/src/components/organisms/tasks/presentation";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
it("keeps a newly added status filter visible before a value is selected", async () => {
  const user = userEvent.setup();
  const setStatusIds = vi.fn();
  const board = {
    filters: { statusIds: [], search: "" },
    statuses: [{ id: "todo", name: "Todo", colorToken: "#64748b" }],
    tasks: [],
    total: 0,
    isLoading: false,
    move: { isPending: false },
    setStatusIds,
    setSearch: vi.fn(),
  } as unknown as ComponentProps<typeof TasksPresentation>["board"];
  render(
    <I18nProvider initialLocale="en">
      <TasksPresentation
        board={board}
        onCreate={() => {}}
        onEdit={() => {}}
        onManageStatuses={() => {}}
      />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Add filter" }));
  await user.click(screen.getByRole("menuitem", { name: "Status" }));
  const select = screen.getByRole("combobox", { name: "Status" });
  expect(select).toHaveTextContent("Choose");
  await user.click(select);
  await user.click(screen.getByRole("option", { name: "Todo" }));
  expect(setStatusIds).toHaveBeenLastCalledWith(["todo"]);
  await user.click(
    screen.getByRole("button", { name: "Remove Status filter" }),
  );
  expect(
    screen.queryByRole("combobox", { name: "Status" }),
  ).not.toBeInTheDocument();
});
