import { changePasswordSchema, updateProfileSchema } from "@next-phish/shared";
import {
  toFormikValidation,
  type ZodCompatible,
} from "../../../lib/to-formik-validation";
import type { TranslationFunction } from "../../../lib/i18n/shared";

const messageKeys: Record<string, string> = {
  "Name is required": "settings.validation.nameRequired",
  "Timezone is required": "settings.validation.timezoneRequired",
  "Language is required": "settings.validation.languageRequired",
  "Current password is required": "settings.validation.currentPasswordRequired",
  "At least 8 characters": "settings.validation.passwordTooShort",
  "Passwords do not match": "settings.validation.passwordMismatch",
};
function localizedValidator(schema: ZodCompatible, t: TranslationFunction) {
  const validate = toFormikValidation(schema);
  return (values: unknown) =>
    Object.fromEntries(
      Object.entries(validate(values)).map(([field, message]) => [
        field,
        t(messageKeys[message] ?? message),
      ]),
    );
}
export function profileValidator(t: TranslationFunction) {
  return localizedValidator(updateProfileSchema, t);
}
export function passwordValidator(t: TranslationFunction) {
  return localizedValidator(changePasswordSchema, t);
}
