import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TasksPresentation } from "../../../../apps/next-app/src/components/organisms/tasks/presentation";
import type { useTaskBoard } from "../../../../apps/next-app/src/hooks/use-task-board";
import { I18nProvider } from "../../../../apps/next-app/src/lib/i18n/client";
import { AppShell, FormMessage } from "../index";
type Board = ReturnType<typeof useTaskBoard>;
const statuses = [
  { id: "todo", name: "To do", colorToken: "#64748b", marksTaskDone: false },
  {
    id: "progress",
    name: "In progress",
    colorToken: "#6d5ce7",
    marksTaskDone: false,
  },
  { id: "done", name: "Done", colorToken: "#16845b", marksTaskDone: true },
];
const initialTasks = [
  {
    id: "task1",
    title: "Review the onboarding simulation",
    description: "Confirm the landing page and email copy before launch.",
    statusId: "todo",
    priority: "HIGH",
    dueAt: "2026-09-18T10:00:00Z",
    isOverdue: false,
    relation: {
      type: "CAMPAIGN",
      id: "demo",
      name: "Onboarding simulation",
      href: "#preview",
    },
  },
  {
    id: "task2",
    title: "Prepare the next awareness report",
    description: "Summarize the latest results and follow-up actions.",
    statusId: "progress",
    priority: "MEDIUM",
    dueAt: null,
    isOverdue: false,
    relation: null,
  },
  {
    id: "task3",
    title: "Check sender configuration",
    description: "",
    statusId: "done",
    priority: "LOW",
    dueAt: null,
    isOverdue: false,
    relation: null,
  },
];
function TasksPreview({ loading = false }: { loading?: boolean }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [statusIds, setStatusIds] = useState<string[]>([]);
  const [notice, setNotice] = useState(false);
  const board = {
    tasks: tasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase()),
    ),
    statuses,
    total: 3,
    filters: { search, statusIds },
    setSearch,
    setStatusIds,
    isLoading: loading,
    error: null,
    moveError: null,
    retry: async () => {},
    move: {
      isPending: false,
      mutate: ({ id, statusId }: { id: string; statusId: string }) =>
        setTasks((items) =>
          items.map((item) => (item.id === id ? { ...item, statusId } : item)),
        ),
    },
  } as unknown as Board;
  return (
    <AppShell
      navigation={[
        {
          id: "planning",
          label: "Planning",
          items: [{ id: "tasks", label: "Tasks", href: "#tasks" }],
        },
      ]}
      activeItem="tasks"
      breadcrumb="Tasks"
      profile={<span>Alex Morgan</span>}
    >
      {notice && (
        <FormMessage variant="info">
          Preview only. No task changes are saved.
        </FormMessage>
      )}
      <TasksPresentation
        board={board}
        onCreate={() => setNotice(true)}
        onEdit={() => setNotice(true)}
        onManageStatuses={() => setNotice(true)}
      />
    </AppShell>
  );
}
const meta = {
  title: "Screens/Tasks",
  component: TasksPreview,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <I18nProvider initialLocale="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof TasksPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Board: Story = {};
export const Loading: Story = { args: { loading: true } };
