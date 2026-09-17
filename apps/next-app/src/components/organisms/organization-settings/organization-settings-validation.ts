import type { ZodType } from "zod";

type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

const messageKeys: Record<string, string> = {
  "Organization name is required": "organizationUi.nameRequired",
  "Slug is required": "organizationUi.slugRequired",
  "Slug must contain only lowercase letters, numbers, and hyphens":
    "organizationUi.slugInvalid",
  "IP address or network is required": "organizationUi.networkRequired",
  "String must contain at most 64 character(s)":
    "organizationUi.networkTooLong",
  "String must contain at most 200 character(s)":
    "organizationUi.descriptionTooLong",
};

/** Runs the shared schema unchanged and translates its field issues for Formik. */
export function localizedZodValidation<T>(schema: ZodType<T>, t: Translate) {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return result.error.issues.reduce<Record<string, string>>(
      (errors, issue) => {
        const field = issue.path.join(".");
        if (field && !errors[field])
          errors[field] = t(
            messageKeys[issue.message] ?? "organizationUi.invalidField",
          );
        return errors;
      },
      {},
    );
  };
}
