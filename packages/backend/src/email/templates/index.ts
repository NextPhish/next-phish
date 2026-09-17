import ejs from "ejs";
import { compiledTemplates } from "./compiled";
export type SystemEmailTemplate = keyof typeof compiledTemplates;
/** MJML is compiled at development/build time; only escaped data is inserted at runtime. */
export function renderTemplate(
  name: SystemEmailTemplate,
  locals: Record<string, unknown> = {},
): string {
  if (!Object.hasOwn(compiledTemplates, name))
    throw new Error("Unknown system email template");
  return ejs.render(compiledTemplates[name], {
    ...locals,
    appUrl: process.env.APP_URL || "#",
  });
}
