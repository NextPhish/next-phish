import type {
  SendingProfileFormValues,
  MailProviderType,
} from "@next-phish/shared";

export function defaultSendingProfileValues(): SendingProfileFormValues {
  return {
    name: "",
    providerType: "",
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    isDefault: false,
    providerConfig: {},
  };
}

export function sendingProfileValuesFromView(profile: {
  name: string;
  providerType: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  isDefault: boolean;
  providerConfig: Record<string, unknown>;
}): SendingProfileFormValues {
  const providerConfig: Record<string, string> = {};
  for (const [key, value] of Object.entries(profile.providerConfig)) {
    if (value == null) continue;
    providerConfig[key] = String(value);
  }
  return {
    name: profile.name,
    providerType: profile.providerType,
    fromName: profile.fromName,
    fromEmail: profile.fromEmail,
    replyToEmail: profile.replyToEmail ?? "",
    isDefault: profile.isDefault,
    providerConfig,
  };
}

export function serializeSendingProfileConfig(
  config: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (["secure", "requireTls", "ignoreCertErrors"].includes(key))
      result[key] = value === "true";
    else if (key === "port" && /^\d+$/.test(value)) result[key] = Number(value);
    else result[key] = value;
  }
  return result;
}

export function createSendingProfilePayload(values: SendingProfileFormValues) {
  return {
    name: values.name.trim(),
    providerType: values.providerType as MailProviderType,
    fromName: values.fromName.trim(),
    fromEmail: values.fromEmail.trim(),
    replyToEmail: values.replyToEmail?.trim() || undefined,
    isDefault: values.isDefault,
    providerConfig: serializeSendingProfileConfig(values.providerConfig),
  };
}

export function updateSendingProfilePayload(
  id: string,
  values: SendingProfileFormValues,
) {
  const { providerType: _providerType, ...fields } =
    createSendingProfilePayload(values);
  void _providerType;
  return { id, ...fields };
}
