import { sendingProfileFormSchema } from "@next-phish/shared";
import { toFormikValidation } from "@/src/lib/to-formik-validation";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

export function sendingProfileValidator(t: TranslationFunction) {
  return (values: unknown) =>
    Object.fromEntries(
      Object.entries(toFormikValidation(sendingProfileFormSchema)(values)).map(
        ([field, error]) => {
          const key =
            field === "name"
              ? "nameRequired"
              : field === "providerType"
                ? "providerRequired"
                : field === "fromName"
                  ? "fromNameRequired"
                  : field === "fromEmail"
                    ? "fromEmailInvalid"
                    : field === "replyToEmail"
                      ? "replyToInvalid"
                      : "invalid";
          void error;
          return [field, t(`sendingProfiles.validation.${key}`)];
        },
      ),
    );
}
