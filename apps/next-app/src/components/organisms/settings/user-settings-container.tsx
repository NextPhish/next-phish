"use client";

import { Bell, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n";
import { ApiKeyList } from "./api-key-list";
import { GeneralTab } from "./general-tab";
import { NotificationsTab } from "./notifications-tab";
import { SecurityTab } from "./security-tab";
import styles from "./profile-settings.module.css";

interface UserSettingsContainerProps {
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

export function UserSettingsContainer({ user }: UserSettingsContainerProps) {
  const t = useTranslation();
  const tabs = [
    { value: "general", label: t("settings.general"), icon: UserRound },
    { value: "security", label: t("settings.security"), icon: ShieldCheck },
    { value: "api-keys", label: t("settings.apiKeys"), icon: KeyRound },
    { value: "notifications", label: t("settings.notifications"), icon: Bell },
  ] as const;
  return (
    <Tabs defaultValue="general" className={styles.tabs}>
      <TabsList
        aria-label={t("settings.accountTitle")}
        className={styles.tabList}
      >
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="general">
        <GeneralTab user={user} />
      </TabsContent>
      <TabsContent value="security">
        <SecurityTab user={user} />
      </TabsContent>
      <TabsContent value="api-keys">
        <ApiKeyList />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsTab />
      </TabsContent>
    </Tabs>
  );
}
