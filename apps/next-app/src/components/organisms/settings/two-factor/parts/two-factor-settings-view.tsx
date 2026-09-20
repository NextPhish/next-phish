"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  FormMessage,
} from "@next-phish/ui";
import { useFormikContext } from "formik";
import { Smartphone } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "@/src/lib/i18n";
import { PasswordPrompt } from "../password-prompt";
import { TotpSetup } from "../totp-setup";

export interface TwoFactorValues {
  password: string;
  verifyCode: string;
}
type Step = "idle" | "password-enable-totp" | "setup" | "password-disable";

interface TwoFactorSettingsViewProps {
  isEnabled: boolean;
  step: Step;
  error: string;
  success: string;
  totpUri: string;
  backupCodes: string[];
  onEnable: () => void;
  onDisable: () => void;
  onClose: () => void;
}

export function TwoFactorSettingsView({
  isEnabled,
  step,
  error,
  success,
  totpUri,
  backupCodes,
  onEnable,
  onDisable,
  onClose,
}: TwoFactorSettingsViewProps) {
  const t = useTranslation();
  const { isSubmitting } = useFormikContext<TwoFactorValues>();
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const enabling = step === "password-enable-totp";
  const title =
    step === "setup"
      ? t("settings.verifyTwoFactorTitle")
      : enabling
        ? t("settings.setupTwoFactorTitle")
        : t("settings.disableTwoFactorTitle");
  const description =
    step === "setup"
      ? t("settings.verifyTwoFactorDialogHint")
      : enabling
        ? t("settings.setupTwoFactorDialogHint")
        : t("settings.disableTwoFactorDialogHint");

  return (
    <Card>
      <CardHeader
        title={t("settings.twoFactorTitle")}
        description={t("settings.twoFactorHint")}
        action={
          <Badge tone={isEnabled ? "success" : "neutral"}>
            {isEnabled ? t("common.enabled") : t("common.disabled")}
          </Badge>
        }
      />
      <CardBody>
        <div className="flex flex-wrap items-start gap-3.5 min-[701px]:flex-nowrap min-[701px]:items-center">
          <span className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--np-tint)] text-[var(--np-primary)]">
            <Smartphone size={20} aria-hidden="true" />
          </span>
          <div className="min-w-[calc(100%-60px)] flex-1 min-[701px]:min-w-0 [&_strong]:block [&_strong]:text-sm [&_strong]:font-[650] [&_p]:mt-1 [&_p]:text-xs [&_p]:leading-6 [&_p]:text-[var(--np-muted)]">
            <strong>{t("settings.authenticatorApp")}</strong>
            <p>
              {isEnabled
                ? t("settings.twoFactorEnabledHint")
                : t("settings.twoFactorDisabledHint")}
            </p>
          </div>
          <Button
            ref={actionButtonRef}
            variant={isEnabled ? "danger" : "secondary"}
            size="sm"
            onClick={isEnabled ? onDisable : onEnable}
          >
            {isEnabled
              ? t("settings.disableAction")
              : t("settings.setupAction")}
          </Button>
        </div>
        {success && (
          <div className="mt-[18px]">
            <FormMessage variant="success">{success}</FormMessage>
          </div>
        )}
      </CardBody>
      <Dialog
        open={step !== "idle"}
        dismissible={!isSubmitting}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          actionButtonRef.current?.focus();
        }}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) onClose();
        }}
        title={title}
        description={description}
        closeLabel={t("settings.closeDialog")}
      >
        {step === "setup" ? (
          <TotpSetup
            totpUri={totpUri}
            backupCodes={backupCodes}
            error={error}
            onCancel={onClose}
          />
        ) : (
          <PasswordPrompt error={error} onCancel={onClose} />
        )}
      </Dialog>
    </Card>
  );
}
