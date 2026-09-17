"use client";
import { Copy } from "lucide-react";
import { Button, Card, CardBody, FormMessage } from "@next-phish/ui";
import { useFormStatus } from "@/src/hooks/use-form-status";
import { useTranslation } from "@/src/lib/i18n";
import styles from "./template-variable-panel.module.css";

const variables = ["{{.Email}}", "{{.FirstName}}", "{{.LastName}}", "{{.URL}}"];
export function TemplateVariablePanel() {
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
  return (
    <Card>
      <CardBody>
        <section className={styles.panel}>
          <div>
            <h2>{t("emailTemplates.variablePanelTitle")}</h2>
            <p>{t("emailTemplates.variablePanelHint")}</p>
          </div>
          <div className={styles.variables}>
            {variables.map((value) => (
              <Button
                key={value}
                type="button"
                variant="secondary"
                onClick={() => void copy(value)}
              >
                <code>{value}</code>
                <Copy size={14} aria-hidden="true" />
              </Button>
            ))}
          </div>
          {status.type === "error" && (
            <FormMessage variant="error">{status.message}</FormMessage>
          )}
          {status.type === "success" && (
            <FormMessage variant="success">{status.message}</FormMessage>
          )}
        </section>
      </CardBody>
    </Card>
  );
}
