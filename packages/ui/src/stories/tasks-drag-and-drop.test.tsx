import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { TasksView } from "../../../../apps/next-app/src/components/organisms/tasks/parts/tasks-view";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const label = this.getAttribute("aria-labelledby");
      const x = label === "status-done" ? 400 : 0;
      const height = label?.startsWith("status-") ? 500 : 100;
      return {
        x,
        y: 0,
        left: x,
        top: 0,
        right: x + 300,
        bottom: height,
        width: 300,
        height,
        toJSON() {},
      };
    },
  );
});
afterEach(() => vi.restoreAllMocks());

function setup(pending = false, failed = false) {
  const mutate = vi.fn();
  const onEdit = vi.fn();
  const board = {
    filters: { statusIds: [], search: "" },
    statuses: [
      { id: "todo", name: "Todo", colorToken: "#64748b" },
      { id: "done", name: "Done", colorToken: "#16845b" },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Review report",
        statusId: "todo",
        priority: "LOW",
      },
    ],
    total: 1,
    isLoading: false,
    move: { isPending: pending, mutate },
    moveError: failed ? new Error("Failed") : null,
    setStatusIds: vi.fn(),
    setSearch: vi.fn(),
  } as unknown as ComponentProps<typeof TasksView>["board"];
  render(
    <I18nProvider initialLocale="en">
      <TasksView
        board={board}
        onCreate={vi.fn()}
        onEdit={onEdit}
        onManageStatuses={vi.fn()}
      />
    </I18nProvider>,
  );
  return {
    mutate,
    onEdit,
    handle: screen.getByRole("button", { name: "Move task: Review report" }),
  };
}

it("moves a task to an empty column using the keyboard drag handle", async () => {
  const user = userEvent.setup();
  const { mutate, handle, onEdit } = setup();
  handle.focus();
  await user.keyboard("[Space]");
  await user.keyboard("[ArrowRight]");
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Over Done"),
  );
  await user.keyboard("[Space]");
  expect(mutate).toHaveBeenCalledExactlyOnceWith({
    id: "task-1",
    statusId: "done",
  });
  expect(onEdit).not.toHaveBeenCalled();
});

it("does not persist a cancelled drag or a drop in the same column", async () => {
  const user = userEvent.setup();
  const { mutate, handle } = setup();
  handle.focus();
  await user.keyboard("[Space][ArrowRight][Escape]");
  expect(mutate).not.toHaveBeenCalled();
  handle.focus();
  await user.keyboard("[Space][Space]");
  expect(mutate).not.toHaveBeenCalled();
});

it("keeps editing separate from dragging and blocks drag while saving", async () => {
  const user = userEvent.setup();
  const { mutate, handle, onEdit } = setup(true);
  expect(handle).toBeDisabled();
  fireEvent.keyDown(handle, { code: "Space" });
  expect(mutate).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: /Review report Low/ }));
  expect(onEdit).toHaveBeenCalledOnce();
});

it("keeps the task in its original column and shows feedback on save failure", () => {
  setup(false, true);
  expect(
    screen.getByText("Could not move the task. Please try again."),
  ).toBeVisible();
  expect(screen.getByRole("region", { name: /Todo/ })).toContainElement(
    screen.getByRole("button", { name: "Move task: Review report" }),
  );
});

it.each(["mouse", "touch"])(
  "moves with a %s pointer and ignores drops outside the board",
  async (pointerType) => {
    class TestPointerEvent extends MouseEvent {
      isPrimary = true;
      pointerId = 1;
      pointerType = pointerType;
    }
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    try {
      const { mutate, handle } = setup();
      fireEvent.pointerDown(handle, { button: 0, clientX: 20, clientY: 20 });
      fireEvent.pointerMove(document, { clientX: 30, clientY: 20 });
      fireEvent.pointerMove(document, { clientX: 450, clientY: 50 });
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent("Over Done"),
      );
      fireEvent.pointerUp(document);
      expect(mutate).toHaveBeenCalledExactlyOnceWith({
        id: "task-1",
        statusId: "done",
      });
      mutate.mockClear();
      fireEvent.pointerDown(handle, { button: 0, clientX: 20, clientY: 20 });
      fireEvent.pointerMove(document, { clientX: 30, clientY: 20 });
      fireEvent.pointerMove(document, { clientX: 900, clientY: 600 });
      fireEvent.pointerUp(document);
      expect(mutate).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  },
);
