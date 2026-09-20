import { expect, it } from "vitest";
import {
  descriptionToEditorBlocks,
  editorBlocksToDescription,
} from "../../../../apps/next-app/src/components/molecules/block-editor/block-editor-values";

it("normalizes Editor.js paragraph, header, and list output and removes unsafe markup", () => {
  const value = editorBlocksToDescription([
    {
      type: "header",
      data: { text: "<strong>Plan</strong><script>bad()</script>", level: 2 },
    },
    {
      type: "paragraph",
      data: {
        text: 'Review <a href="javascript:bad()">this</a> or <a href="https://example.com/guide">the guide</a>',
      },
    },
    {
      type: "list",
      data: {
        style: "ordered",
        items: [
          { content: "First", items: [], meta: {} },
          { content: "<em>Second</em>", items: [], meta: {} },
        ],
      },
    },
  ]);
  expect(value).toEqual({
    version: 1,
    blocks: [
      { type: "header", data: { text: "<strong>Plan</strong>", level: 2 } },
      {
        type: "paragraph",
        data: {
          text: 'Review this or <a href="https://example.com/guide">the guide</a>',
        },
      },
      {
        type: "list",
        data: { style: "ordered", items: ["First", "<em>Second</em>"] },
      },
    ],
  });
});

it("returns null for empty editor output and sanitizes stored blocks before editing", () => {
  expect(
    editorBlocksToDescription([{ type: "paragraph", data: { text: "  " } }]),
  ).toBeNull();
  expect(
    descriptionToEditorBlocks({
      version: 1,
      blocks: [
        {
          type: "paragraph",
          data: { text: "<img src=x onerror=alert(1)>Safe" },
        },
      ],
    }),
  ).toEqual([{ type: "paragraph", data: { text: "Safe" } }]);
});

it("hydrates flat stored list items into the nested Editor.js List v2 format", () => {
  const blocks = descriptionToEditorBlocks({
    version: 1,
    blocks: [
      {
        type: "list",
        data: {
          style: "unordered",
          items: ["<strong>First</strong>", "Second"],
        },
      },
    ],
  });
  expect(blocks).toEqual([
    {
      type: "list",
      data: {
        style: "unordered",
        items: [
          { content: "<strong>First</strong>", meta: {}, items: [] },
          { content: "Second", meta: {}, items: [] },
        ],
      },
    },
  ]);
  expect(editorBlocksToDescription(blocks)).toEqual({
    version: 1,
    blocks: [
      {
        type: "list",
        data: {
          style: "unordered",
          items: ["<strong>First</strong>", "Second"],
        },
      },
    ],
  });
});
