import { Copy } from "lucide-react";
import { Button, Card, CardBody, FormMessage } from "@next-phish/ui";
import type { FormStatus } from "@/src/hooks/use-form-status";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

interface Props {
  variables: string[];
  t: TranslationFunction;
  status: FormStatus;
  onCopy: (value: string) => Promise<void>;
}

export function TemplateVariablePanelView({
  variables,
  t,
  status,
  onCopy,
}: Props) {
  return (
    <Card>
      <CardBody>
        <section className="grid gap-3.5">
          <div>
            <h2 className="text-base text-[var(--np-ink)]">
              {t("emailTemplates.variablePanelTitle")}
            </h2>
            <p className="mt-1 text-xs text-[var(--np-muted)]">
              {t("emailTemplates.variablePanelHint")}
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-2 max-[360px]:grid-cols-[minmax(0,1fr)]">
            {variables.map((value) => (
              <Button
                key={value}
                type="button"
                variant="secondary"
                className="min-w-0 justify-between"
                onClick={() => void onCopy(value)}
              >
                <code className="truncate">{value}</code>
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
