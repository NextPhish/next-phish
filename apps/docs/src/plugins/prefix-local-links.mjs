// Markdown links are authored from the docs root. GitHub Pages serves this site
// below /next-phish/, so prefix them only in builds configured with a base path.
export function prefixLocalLinks({ base }) {
  const prefix = base === "/" ? "" : `/${base.replace(/^\/+|\/+$/g, "")}`;

  return (tree) => {
    if (!prefix) return;

    const visit = (node) => {
      if (node.type === "element") {
        for (const attribute of ["href", "src"]) {
          const value = node.properties?.[attribute];
          if (
            typeof value === "string" &&
            value.startsWith("/") &&
            !value.startsWith("//") &&
            value !== prefix &&
            !value.startsWith(`${prefix}/`)
          ) {
            node.properties[attribute] = `${prefix}${value}`;
          }
        }
      }

      for (const child of node.children || []) visit(child);
    };

    visit(tree);
  };
}
