import sanitizeHtml from "sanitize-html";
import type { TaskDescription, TaskDescriptionBlock } from "@next-phish/shared";

export const sanitizeDescriptionInline = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["a", "br", "strong", "b", "em", "i", "u"],
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  }).replace(/<a>([\s\S]*?)<\/a>/gi, "$1");

type EditorBlock = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

export function descriptionToEditorBlocks(
  value: TaskDescription | null,
): EditorBlock[] {
  if (!value) return [];
  return value.blocks.map((block): EditorBlock => {
    if (block.type === "list")
      return {
        ...block,
        data: {
          ...block.data,
          items: block.data.items.map((item) => ({
            content: sanitizeDescriptionInline(item),
            meta: {},
            items: [],
          })),
        },
      };
    if (block.type === "header")
      return {
        ...block,
        data: {
          ...block.data,
          text: sanitizeDescriptionInline(block.data.text),
        },
      };
    return {
      ...block,
      data: { text: sanitizeDescriptionInline(block.data.text) },
    };
  });
}

export function editorBlocksToDescription(
  blocks: Array<{ id?: string; type: string; data: Record<string, unknown> }>,
): TaskDescription | null {
  const normalized = blocks
    .flatMap((block): TaskDescriptionBlock[] => {
      if (block.type === "header")
        return [
          {
            ...(block.id ? { id: block.id } : {}),
            type: "header",
            data: {
              text: sanitizeDescriptionInline(String(block.data.text ?? "")),
              level: Number(block.data.level) as 1 | 2 | 3 | 4 | 5 | 6,
            },
          },
        ];
      if (block.type === "list")
        return [
          {
            ...(block.id ? { id: block.id } : {}),
            type: "list",
            data: {
              style: block.data.style === "ordered" ? "ordered" : "unordered",
              items: Array.isArray(block.data.items)
                ? block.data.items.map((item) =>
                    sanitizeDescriptionInline(
                      typeof item === "object" &&
                        item !== null &&
                        "content" in item
                        ? String(item.content ?? "")
                        : String(item),
                    ),
                  )
                : [],
            },
          },
        ];
      if (block.type === "paragraph")
        return [
          {
            ...(block.id ? { id: block.id } : {}),
            type: "paragraph",
            data: {
              text: sanitizeDescriptionInline(String(block.data.text ?? "")),
            },
          },
        ];
      return [];
    })
    .filter((block) => block.type !== "paragraph" || block.data.text.trim());
  return normalized.length ? { version: 1, blocks: normalized } : null;
}
