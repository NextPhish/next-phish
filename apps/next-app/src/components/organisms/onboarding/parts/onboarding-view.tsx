"use client";
import { Form, useFormikContext } from "formik";
import { Button, FormMessage } from "@next-phish/ui";
import { useTranslation } from "../../../../lib/i18n";
import type { SlugStatus } from "../../../../hooks/slug-availability.types";
import { OnboardingFields } from "./onboarding-fields";
export interface OnboardingValues {
  name: string;
  slug: string;
}
export function OnboardingView({
  error,
  slugStatus = "idle",
  onCancel,
}: {
  error: string;
  slugStatus?: SlugStatus;
  onCancel?: () => void;
}) {
  const t = useTranslation();
  const { isSubmitting } = useFormikContext<OnboardingValues>();
  return (
    <div className="grid gap-6">
      {!onCancel && (
        <FormMessage variant="info" title={t("onboarding.infoTitle")}>
          {t("onboarding.infoBody")}
        </FormMessage>
      )}
      <Form noValidate className="grid gap-6">
        <OnboardingFields />
        {slugStatus !== "idle" && (
          <div className="-mt-3 font-semibold">
            <FormMessage
              variant={
                slugStatus === "available"
                  ? "success"
                  : slugStatus === "checking"
                    ? "info"
                    : "error"
              }
            >
              {t(
                slugStatus === "error"
                  ? "onboarding.slugCheckError"
                  : `common.${slugStatus}`,
              )}
            </FormMessage>
          </div>
        )}
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <div className={onCancel ? "flex justify-end gap-2.5 pt-1" : "grid"}>
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              slugStatus === "taken" ||
              slugStatus === "checking"
            }
          >
            {t(onCancel ? "common.create" : "onboarding.createOrganization")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
