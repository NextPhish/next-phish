import { expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TaskDescription } from "@next-phish/shared";
import { Tasks } from "../../../../apps/next-app/src/components/organisms/tasks";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
const board = vi.hoisted(() => {
  const mutation = () => ({
    isPending: false,
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
  });
  return {
    statuses: [{ id: "todo", name: "Todo" }],
    tasks: [
      {
        id: "task1",
        title: "Existing task",
        description: null,
        statusId: "todo",
        priority: "MEDIUM",
        dueAt: null,
        relation: null,
        assignee: null,
      },
    ],
    create: mutation(),
    update: mutation(),
    remove: mutation(),
  };
});
const descriptionSave = vi.hoisted(() =>
  vi.fn<() => Promise<TaskDescription | null>>(async () => null),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/tasks/hooks/use-task-board",
  () => ({ useTaskBoard: () => board }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/tasks/parts/tasks-view",
  () => ({
    TasksView: ({
      onCreate,
      onEdit,
    }: {
      onCreate: () => void;
      onEdit: (task: unknown) => void;
    }) => (
      <>
        <button onClick={() => onCreate()}>Create</button>
        <button onClick={() => onEdit(board.tasks[0])}>Edit</button>
      </>
    ),
  }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/tasks/task-status-manager/task-status-manager",
  () => ({ TaskStatusManager: () => null }),
);
vi.mock(
  "../../../../apps/next-app/src/components/organisms/tasks/task-editor/parts/task-form-view",
  async () => {
    const { Form, Field } = await import("formik");
    const { useEffect } = await import("react");
    return {
      TaskFormView: ({
        onCancel,
        error,
        descriptionEditorRef,
      }: {
        onCancel: () => void;
        error: string;
        descriptionEditorRef: {
          current: { save: typeof descriptionSave } | null;
        };
      }) => (
        <MockTaskForm
          onCancel={onCancel}
          error={error}
          descriptionEditorRef={descriptionEditorRef}
        />
      ),
    };

    function MockTaskForm({
      onCancel,
      error,
      descriptionEditorRef,
    }: {
      onCancel: () => void;
      error: string;
      descriptionEditorRef: {
        current: { save: typeof descriptionSave } | null;
      };
    }) {
      useEffect(() => {
        descriptionEditorRef.current = { save: descriptionSave };
        return () => {
          descriptionEditorRef.current = null;
        };
      }, [descriptionEditorRef]);
      return (
        <Form>
          <label>
            Title
            <Field name="title" />
          </label>
          {error && <p>{error}</p>}
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </Form>
      );
    }
  },
);
it("preserves draft edits when deletion is canceled and retains the form after a failed save", async () => {
  const user = userEvent.setup();
  board.update.mutateAsync.mockRejectedValue(new Error("server error"));
  render(
    <I18nProvider initialLocale="en">
      <Tasks />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Edit" }));
  const title = screen.getByLabelText("Title");
  await user.clear(title);
  await user.type(title, "Unsaved draft");
  await user.click(screen.getByRole("button", { name: "Delete task" }));
  const confirm = screen.getByRole("dialog", { name: "Delete this task?" });
  await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
  expect(screen.getByLabelText("Title")).toHaveValue("Unsaved draft");
  expect(board.remove.mutateAsync).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    await screen.findByText("Could not save the task. Please try again."),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Title")).toHaveValue("Unsaved draft");
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  await user.click(screen.getByRole("button", { name: "Create" }));
  expect(screen.getByLabelText("Title")).toHaveValue("");
});

it("preserves the due-date instant when preparing a task for editing", async () => {
  const { taskInitialValues } =
    await import("../../../../apps/next-app/src/components/organisms/tasks/task-form-helpers");
  const dueAt = new Date(2026, 8, 15, 14, 30);
  const task = { ...board.tasks[0], priority: "MEDIUM" as const, dueAt };
  const values = taskInitialValues(task, "todo");
  expect(values.dueAt).toBe("2026-09-15T14:30");
  expect(new Date(values.dueAt!).toISOString()).toBe(dueAt.toISOString());
});

it("returns nested Formik errors for an incomplete related resource", async () => {
  const { taskValidator } =
    await import("../../../../apps/next-app/src/components/organisms/tasks/task-form-helpers");
  const { createTranslator } =
    await import("../../../../apps/next-app/src/lib/i18n");
  const errors = taskValidator(createTranslator("en"))({
    title: "Task",
    description: null,
    statusId: "todo",
    priority: "MEDIUM",
    relation: { type: "CAMPAIGN", id: "" },
  });
  expect(errors).toEqual({
    relation: { id: "Choose a related resource or clear the resource type." },
  });
});

it("flushes the latest Editor.js value before sending the task mutation", async () => {
  const user = userEvent.setup();
  board.update.mutateAsync.mockClear();
  descriptionSave.mockClear();
  let finishSave: ((value: TaskDescription | null) => void) | undefined;
  descriptionSave.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishSave = resolve;
      }),
  );
  board.update.mutateAsync.mockResolvedValueOnce(undefined);
  render(
    <I18nProvider initialLocale="en">
      <Tasks />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(board.update.mutateAsync).not.toHaveBeenCalled();
  finishSave?.({
    version: 1,
    blocks: [{ type: "paragraph", data: { text: "Latest text" } }],
  });
  await vi.waitFor(() =>
    expect(board.update.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        description: {
          version: 1,
          blocks: [{ type: "paragraph", data: { text: "Latest text" } }],
        },
      }),
    ),
  );
});

it("shows a localized error and skips the mutation when Editor.js cannot save", async () => {
  const user = userEvent.setup();
  board.update.mutateAsync.mockClear();
  descriptionSave.mockRejectedValueOnce(new Error("editor unavailable"));
  render(
    <I18nProvider initialLocale="en">
      <Tasks />
    </I18nProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    await screen.findByText("Could not save the task. Please try again."),
  ).toBeInTheDocument();
  expect(board.update.mutateAsync).not.toHaveBeenCalled();
});
