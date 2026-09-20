import { organizationCreateMemberSchema } from "@next-phish/shared";
import type { OrganizationCreateMemberInput } from "@next-phish/shared";

type Translate = (key: string) => string;

export function validateAddMember(
  values: OrganizationCreateMemberInput,
  t: Translate,
) {
  const result = organizationCreateMemberSchema.safeParse(values);
  if (result.success) return {};
  return result.error.issues.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.path[0];
    if (field === "name" && !errors.name)
      errors.name = t("organizations.validation.nameRequired");
    if (field === "email" && !errors.email)
      errors.email = t("organizations.validation.emailInvalid");
    return errors;
  }, {});
}
