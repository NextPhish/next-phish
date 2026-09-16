import type { z } from "zod";
import { getIn, setIn } from "formik";
type Translate = (key: string) => string;
const keys: Record<string, string> = {
  "Group name is required": "targetGroups.groupNameRequired",
  "First name is required": "targetGroups.firstNameRequired",
  "Last name is required": "targetGroups.lastNameRequired",
  "Invalid email address": "targetGroups.invalidEmail",
};
export function validateTargetGroup<T>(
  schema: z.ZodType<T>,
  values: T,
  t: Translate,
) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  return result.error.issues.reduce<Record<string, unknown>>(
    (errors, issue) => {
      const path = issue.path.join(".");
      if (path && !getIn(errors, path))
        return setIn(
          errors,
          path,
          t(
            keys[issue.message] ??
              (issue.code === "invalid_string" && issue.validation === "email"
                ? "targetGroups.invalidEmail"
                : "targetGroups.invalidField"),
          ),
        );
      return errors;
    },
    {},
  );
}
