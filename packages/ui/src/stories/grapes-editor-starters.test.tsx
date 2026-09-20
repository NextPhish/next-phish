import { expect, it } from "vitest";
import grapesjs from "../../../../apps/next-app/node_modules/grapesjs";
import {
  emailStarterContent,
  buildEditorHtml,
  initialEditorHtml,
  pageStarterContent,
} from "../../../../apps/next-app/src/components/organisms/grapes-editor/starter-content";

it("uses polished starters only when a record has no saved HTML", () => {
  expect(initialEditorHtml("email")).toBe(emailStarterContent);
  expect(initialEditorHtml("page")).toBe(pageStarterContent);
  expect(initialEditorHtml("email", "<p>Saved</p>")).toBe("<p>Saved</p>");
  expect(initialEditorHtml("page", "")).toBe("");
});

it("uses only supported recipient tokens and the campaign action URL in email", () => {
  const tokens = [
    ...emailStarterContent.matchAll(/\{\{\.([A-Za-z]+)\}\}/g),
  ].map((match) => match[1]);
  expect(new Set(tokens)).toEqual(new Set(["FirstName", "Email", "URL"]));
  expect(emailStarterContent).toContain('href="{{.URL}}"');
  expect(pageStarterContent).toContain("{{.FirstName}}");
  expect(pageStarterContent).toContain("{{.Email}}");
  expect(emailStarterContent).not.toMatch(/<input|<form|password/i);
  expect(pageStarterContent).not.toMatch(/<input|<form|password/i);
});

it.each([
  ["email", emailStarterContent],
  ["page", pageStarterContent],
] as const)(
  "survives a real GrapesJS %s component roundtrip",
  (_mode, starter) => {
    const editor = grapesjs.init({ headless: true, storageManager: false });
    editor.setComponents(starter);
    const output = buildEditorHtml(editor.getHtml(), editor.getCss() ?? "");
    expect(output).toContain('name="viewport"');
    expect(output).toContain("{{.FirstName}}");
    if (starter === emailStarterContent)
      expect(output).toContain('href="{{.URL}}"');
    else expect(output).toMatch(/@media\s*\(max-width:560px\)/);
    editor.destroy();
  },
);
