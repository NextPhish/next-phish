import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { TaskDescription } from "@next-phish/shared";
import {
  BlockEditor,
  TaskDescriptionPreview,
} from "../../../../apps/next-app/src/components/molecules/block-editor";

const initialDescription: TaskDescription = {
  version: 1,
  blocks: [
    {
      type: "header",
      data: { text: "План за задачата", level: 2 },
    },
    {
      type: "paragraph",
      data: {
        text: "Проверете <strong>съдържанието</strong> преди публикуване.",
      },
    },
    {
      type: "list",
      data: {
        style: "unordered",
        items: ["Преглед на имейла", "Проверка на целевата страница"],
      },
    },
  ],
};

function BulgarianEditorPreview() {
  const [description, setDescription] = useState<TaskDescription | null>(
    initialDescription,
  );
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6">
      <label className="mb-2 block font-semibold" htmlFor="task-editor-preview">
        Описание
      </label>
      <BlockEditor
        id="task-editor-preview"
        label="Описание"
        locale="bg"
        value={description}
        onChange={setDescription}
      />
      <p className="mt-6 text-sm font-semibold">Преглед на описанието</p>
      {description && <TaskDescriptionPreview value={description} />}
      <p className="mt-6 text-sm font-semibold">Запазена JSON стойност</p>
      <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(description, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "Planning/Task Block Editor",
  component: BlockEditor,
  parameters: { layout: "padded" },
} satisfies Meta<typeof BlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bulgarian: Story = {
  args: {
    label: "Описание",
    value: null,
    onChange: () => {},
  },
  render: () => <BulgarianEditorPreview />,
};
