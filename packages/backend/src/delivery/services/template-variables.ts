function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export function renderTemplateVariables(
  html: string,
  values: Record<string, string>,
): string {
  return html.replace(
    /\{\{\s*\.?\s*([a-zA-Z]+)\s*\}\}/g,
    (match, key: string) =>
      Object.hasOwn(values, key) ? escapeHtml(values[key]!) : match,
  );
}
