import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { TaskDescriptionPreview } from "../../../../apps/next-app/src/components/molecules/block-editor";

it("renders task description headings, paragraphs, lists, and safe inline markup", () => {
  const { container } = render(
    <TaskDescriptionPreview
      value={{
        version: 1,
        blocks: [
          {
            type: "header",
            data: { level: 3, text: "<strong>Review plan</strong>" },
          },
          {
            type: "paragraph",
            data: {
              text: 'Open the <a href="https://example.com/guide">guide</a>.',
            },
          },
          {
            type: "list",
            data: {
              style: "ordered",
              items: ["First item", "<em>Second item</em>"],
            },
          },
          {
            type: "list",
            data: { style: "unordered", items: ["Final check"] },
          },
        ],
      }}
    />,
  );
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "Review plan",
  );
  expect(screen.getByRole("link", { name: "guide" })).toHaveAttribute(
    "href",
    "https://example.com/guide",
  );
  expect(
    within(container.querySelector("ol")!).getAllByRole("listitem"),
  ).toHaveLength(2);
  expect(
    within(container.querySelector("ul")!).getAllByRole("listitem"),
  ).toHaveLength(1);
  expect(container.querySelector("strong")).toHaveTextContent("Review plan");
  expect(container.querySelector("em")).toHaveTextContent("Second item");
});

it("removes executable markup and unsafe links while preserving their text", () => {
  const { container } = render(
    <TaskDescriptionPreview
      value={{
        version: 1,
        blocks: [
          {
            type: "paragraph",
            data: {
              text: '<img src=x onerror=alert(1)><script>bad()</script><a href="javascript:bad()">Keep me</a>',
            },
          },
        ],
      }}
    />,
  );
  expect(screen.getByText("Keep me")).toBeInTheDocument();
  expect(container.querySelector("a")).toBeNull();
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector("script")).toBeNull();
});
