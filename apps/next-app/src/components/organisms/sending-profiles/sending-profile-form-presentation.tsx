"use client";
import { Form, useFormikContext } from "formik";
import {
  Card,
  CardBody,
  Button,
  Checkbox,
  FormErrorSummary,
  FormField,
  FormMessage,
  PageHeader,
  Select,
} from "@next-phish/ui";
import {
  MAIL_PROVIDER_TYPES,
  type SendingProfileFormValues,
} from "@next-phish/shared";
import { useTranslation } from "@/src/lib/i18n";
import { ConfigInput } from "./config-input";
import { SmtpConfigFields } from "./smtp-config-fields";
import { MsGraphConfigFields } from "./ms-graph-config-fields";
import { AwsSesConfigFields } from "./aws-ses-config-fields";
import { SendGridConfigFields } from "./sendgrid-config-fields";
import { MailgunConfigFields } from "./mailgun-config-fields";
import { PostmarkConfigFields } from "./postmark-config-fields";
import { ResendConfigFields } from "./resend-config-fields";
import { GeneralApiConfigFields } from "./general-api-config-fields";
import styles from "./sending-profile-form.module.css";

interface Props {
  error: string;
  isEdit: boolean;
  onCancel: () => void;
  onTest: () => void;
}

const providerLabels: Record<string, string> = {
  SMTP: "SMTP",
  MICROSOFT_GRAPH: "Microsoft Graph",
  AWS_SES: "AWS SES",
  SENDGRID: "SendGrid",
  MAILGUN: "Mailgun",
  POSTMARK: "Postmark",
  RESEND: "Resend",
  GENERAL_API: "General API",
};

function ProviderConfigFields({ providerType }: { providerType: string }) {
  switch (providerType) {
    case "SMTP":
      return <SmtpConfigFields />;
    case "MICROSOFT_GRAPH":
      return <MsGraphConfigFields />;
    case "AWS_SES":
      return <AwsSesConfigFields />;
    case "SENDGRID":
      return <SendGridConfigFields />;
    case "MAILGUN":
      return <MailgunConfigFields />;
    case "POSTMARK":
      return <PostmarkConfigFields />;
    case "RESEND":
      return <ResendConfigFields />;
    case "GENERAL_API":
      return <GeneralApiConfigFields />;
    default:
      return null;
  }
}

export function SendingProfileFormPresentation({
  error,
  isEdit,
  onCancel,
  onTest,
}: Props) {
  const t = useTranslation();
  const { values, errors, submitCount, isSubmitting, isValid, setFieldValue } =
    useFormikContext<SendingProfileFormValues>();
  const summary = submitCount
    ? Object.entries(errors)
        .filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        )
        .map(([field, message]) => ({ id: `sending-${field}`, message }))
    : [];
  return (
    <div className={styles.page}>
      <PageHeader
        title={
          isEdit
            ? t("sendingProfiles.editProfile")
            : t("sendingProfiles.createTitle")
        }
        description={
          isEdit
            ? t("sendingProfiles.editSubtitle")
            : t("sendingProfiles.createSubtitle")
        }
      />
      <Form noValidate className={styles.form}>
        <FormErrorSummary
          title={t("sendingProfiles.validationSummary")}
          errors={summary}
        />
        <Card>
          <CardBody>
            <div className={styles.fields}>
              <ConfigInput
                name="name"
                label={t("sendingProfiles.name")}
                placeholder={t("sendingProfiles.namePlaceholder")}
                required
              />
              <FormField
                id="sending-providerType"
                label={t("sendingProfiles.providerType")}
                required
                error={
                  submitCount && errors.providerType
                    ? errors.providerType
                    : undefined
                }
              >
                {(control) => (
                  <Select
                    {...control}
                    value={values.providerType}
                    disabled={isEdit}
                    placeholder={t("sendingProfiles.chooseProvider")}
                    options={MAIL_PROVIDER_TYPES.map((value) => ({
                      value,
                      label: providerLabels[value] ?? value,
                    }))}
                    onValueChange={(value) => {
                      setFieldValue("providerType", value);
                      setFieldValue("providerConfig", {});
                    }}
                  />
                )}
              </FormField>
              <ConfigInput
                name="fromName"
                label={t("sendingProfiles.fromName")}
                placeholder={t("sendingProfiles.fromNamePlaceholder")}
                required
              />
              <ConfigInput
                name="fromEmail"
                label={t("sendingProfiles.fromEmail")}
                placeholder={t("sendingProfiles.fromEmailPlaceholder")}
                type="email"
                required
              />
              <ConfigInput
                name="replyToEmail"
                label={t("sendingProfiles.replyToEmail")}
                placeholder={t("sendingProfiles.replyToEmailPlaceholder")}
                type="email"
              />
              <div className={styles.checkField}>
                <Checkbox
                  id="sending-isDefault"
                  checked={values.isDefault}
                  onCheckedChange={(checked) =>
                    setFieldValue("isDefault", checked === true)
                  }
                />
                <label htmlFor="sending-isDefault">
                  {t("sendingProfiles.isDefault")}
                </label>
                <span>{t("sendingProfiles.isDefaultHint")}</span>
              </div>
            </div>
          </CardBody>
        </Card>
        {values.providerType && (
          <Card>
            <CardBody>
              <section className={styles.config}>
                <div>
                  <h2>{t("sendingProfiles.providerConfig")}</h2>
                  <p>
                    {providerLabels[values.providerType] ?? values.providerType}
                  </p>
                </div>
                <div className={styles.configFields}>
                  <ProviderConfigFields providerType={values.providerType} />
                </div>
              </section>
            </CardBody>
          </Card>
        )}
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          {isEdit && (
            <Button
              variant="secondary"
              disabled={!isValid || isSubmitting}
              onClick={onTest}
            >
              {t("sendingProfiles.testEmailSend")}
            </Button>
          )}
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? t("common.saveChanges") : t("common.create")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
