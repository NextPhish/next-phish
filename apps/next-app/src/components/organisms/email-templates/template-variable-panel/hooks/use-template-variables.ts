import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";

const variables = ["{{.Email}}", "{{.FirstName}}", "{{.LastName}}", "{{.URL}}"];

export function useTemplateVariables() {
  const t = useTranslation();
  const { status, setError, setSuccess } = useFormStatus();

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setSuccess(t("emailTemplates.copiedVariable", { value }));
    } catch {
      setError(t("emailTemplates.copyFailed"));
    }
  }

  return { variables, t, status, onCopy: copy };
}
