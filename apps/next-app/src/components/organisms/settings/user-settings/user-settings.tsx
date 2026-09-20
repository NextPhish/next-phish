"use client";

import { Bell, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { ApiKeyList } from "../api-key-list";
import { GeneralSettings } from "../general-settings";
import { NotificationsSettings } from "./parts/notifications-settings";
import { SecuritySettings } from "./parts/security-settings";

interface UserSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
    timezone?: string | null;
    language?: string | null;
    twoFactorEnabled?: boolean | null;
  };
}

export function UserSettings({ user }: UserSettingsProps) {
  const t = useTranslation();
  const tabs = [
    { value: "general", label: t("settings.general"), icon: UserRound },
    { value: "security", label: t("settings.security"), icon: ShieldCheck },
    { value: "api-keys", label: t("settings.apiKeys"), icon: KeyRound },
    { value: "notifications", label: t("settings.notifications"), icon: Bell },
  ] as const;
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList
        aria-label={t("settings.accountTitle")}
        className="gap-5 min-[701px]:gap-7 [&_.np-tabs-trigger]:inline-flex [&_.np-tabs-trigger]:items-center [&_.np-tabs-trigger]:gap-[7px]"
      >
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="general">
        <GeneralSettings user={user} />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings user={user} />
      </TabsContent>
      <TabsContent value="api-keys">
        <ApiKeyList />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsSettings />
      </TabsContent>
    </Tabs>
  );
}
