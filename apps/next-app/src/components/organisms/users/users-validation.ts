import type { z } from "zod";
const keys: Record<string, string> = {
  "Name is required": "usersUi.nameRequired",
  "Invalid email": "usersUi.emailInvalid",
  "Select an organization": "usersUi.selectOrganization",
};
export function validateCreateUser<T>(
  schema: z.ZodType<T>,
  values: T,
  t: (key: string) => string,
) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  return result.error.issues.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.path.join(".");
    if (field && !errors[field])
      errors[field] = t(keys[issue.message] ?? "usersUi.invalidField");
    return errors;
  }, {});
}
