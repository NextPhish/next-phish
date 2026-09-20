import type { ElementType } from "react";
import type { TaskDescription } from "@next-phish/shared";
import { sanitizeDescriptionInline } from "./block-editor-values";

export function TaskDescriptionPreview({ value }: { value: TaskDescription }) {
  return (
    <div className="mt-2 max-h-36 space-y-1.5 overflow-hidden text-[13px] leading-5 text-[var(--np-muted)] [&_a]:font-medium [&_a]:text-[var(--np-primary)] [&_a]:underline [&_a]:underline-offset-2 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h4]:text-[13px] [&_h5]:text-xs [&_h6]:text-xs [&_li]:pl-0.5 [&_ol]:list-decimal [&_ul]:list-disc">
      {value.blocks.map((block, blockIndex) => {
        const key = block.id ?? `${block.type}-${blockIndex}`;
        if (block.type === "header") {
          const Heading = `h${block.data.level}` as ElementType;
          return (
            <Heading
              key={key}
              className="font-semibold text-[var(--np-ink)]"
              dangerouslySetInnerHTML={{
                __html: sanitizeDescriptionInline(block.data.text),
              }}
            />
          );
        }
        if (block.type === "list") {
          const List = block.data.style === "ordered" ? "ol" : "ul";
          return (
            <List key={key} className="space-y-0.5 pl-5">
              {block.data.items.map((item, itemIndex) => (
                <li
                  key={`${key}-item-${itemIndex}`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeDescriptionInline(item),
                  }}
                />
              ))}
            </List>
          );
        }
        return (
          <p
            key={key}
            dangerouslySetInnerHTML={{
              __html: sanitizeDescriptionInline(block.data.text),
            }}
          />
        );
      })}
    </div>
  );
}
