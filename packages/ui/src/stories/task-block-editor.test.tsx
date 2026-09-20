import { createRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import {
  BlockEditor,
  type BlockEditorHandle,
} from "../../../../apps/next-app/src/components/molecules/block-editor";

const editorMock = vi.hoisted(() => ({
  config: undefined as Record<string, unknown> | undefined,
  readOnly: false,
  toggle: vi.fn((enabled: boolean) => {
    editorMock.readOnly = enabled;
  }),
  save: vi.fn(async () => {
    if (editorMock.readOnly) throw new Error("Editor is read-only");
    return {
      blocks: [
        {
          type: "paragraph",
          data: { text: "Latest description" },
        },
      ],
    };
  }),
}));

vi.mock(
  "../../../../apps/next-app/node_modules/@editorjs/editorjs/dist/editorjs.umd.js",
  () => ({
    default: class EditorMock {
      isReady = Promise.resolve();
      saver = { save: editorMock.save };
      readOnly = { toggle: editorMock.toggle };
      destroy = vi.fn();

      constructor(config: Record<string, unknown>) {
        editorMock.config = config;
      }
    },
  }),
);
vi.mock(
  "../../../../apps/next-app/node_modules/@editorjs/header/dist/header.mjs",
  () => ({ default: class HeaderMock {} }),
);
vi.mock(
  "../../../../apps/next-app/node_modules/@editorjs/list/dist/editorjs-list.mjs",
  () => ({ default: class ListMock {} }),
);

it("keeps Editor.js writable for the final save while disabling holder interaction", async () => {
  const ref = createRef<BlockEditorHandle>();
  const onChange = vi.fn();
  const { rerender } = render(
    <BlockEditor
      ref={ref}
      id="task-description-test"
      label="Description"
      value={null}
      onChange={onChange}
    />,
  );
  await waitFor(() => expect(editorMock.config).toBeDefined());

  rerender(
    <BlockEditor
      ref={ref}
      id="task-description-test"
      label="Description"
      value={null}
      onChange={onChange}
      disabled
    />,
  );

  const holder = screen.getByRole("group", { name: "Description" });
  expect(holder).toHaveAttribute("inert");
  expect(holder).toHaveAttribute("aria-disabled", "true");
  expect(editorMock.config).not.toHaveProperty("readOnly", true);
  expect(editorMock.toggle).not.toHaveBeenCalled();

  let saved;
  await act(async () => {
    saved = await ref.current?.save();
  });
  expect(saved).toEqual({
    version: 1,
    blocks: [{ type: "paragraph", data: { text: "Latest description" } }],
  });
  expect(onChange).toHaveBeenCalledWith(saved);
});
