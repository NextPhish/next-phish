import type { z } from "zod";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;
const messageKeys: Record<string, string> = {
  "Page name is required": "pages.nameRequired",
  "Page path must be 120 characters or fewer": "pages.pathTooLong",
  "Use URL-safe path segments such as login or account/verify":
    "pages.pathInvalid",
  "This path is reserved by the public content server": "pages.pathReserved",
};

/** Runs the shared page schema unchanged and localizes only its Formik issues. */
export function localizedPageValidation<T>(schema: z.ZodType<T>, t: Translate) {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return result.error.issues.reduce<Record<string, string>>(
      (errors, issue) => {
        const field = issue.path.join(".");
        if (field && !errors[field])
          errors[field] = t(messageKeys[issue.message] ?? "pages.invalidField");
        return errors;
      },
      {},
    );
  };
}
