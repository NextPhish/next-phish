export function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}
function matches(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").some((part) => {
    const token = part.trim().toLowerCase();
    if (token.startsWith(".")) return file.name.toLowerCase().endsWith(token);
    if (token.endsWith("/*"))
      return file.type.toLowerCase().startsWith(token.slice(0, -1));
    return file.type.toLowerCase() === token;
  });
}
export function validateFiles(
  incoming: File[],
  existing: File[],
  constraints: { accept?: string; maxFileSize: number; maxFiles: number },
  labels: {
    type: (name: string) => string;
    size: (name: string) => string;
    count: (count: number) => string;
  },
) {
  const files = [...existing];
  const errors: string[] = [];
  for (const file of incoming) {
    if (files.some((item) => fileKey(item) === fileKey(file))) continue;
    if (!matches(file, constraints.accept)) {
      errors.push(labels.type(file.name));
      continue;
    }
    if (file.size > constraints.maxFileSize) {
      errors.push(labels.size(file.name));
      continue;
    }
    if (files.length >= constraints.maxFiles) {
      errors.push(labels.count(constraints.maxFiles));
      continue;
    }
    files.push(file);
  }
  return { files, errors: [...new Set(errors)] };
}
