"use client";

import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@next-phish/ui";
import type { OrganizationView } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";
import { GeneralFormContainer } from "./general-form-container";
import { IgnoredNetworksContainer } from "./ignored-networks-container";
import styles from "./organization-settings.module.css";

interface OrganizationSettingsProps {
  organization: OrganizationView;
}

export function OrganizationSettings({
  organization,
}: OrganizationSettingsProps) {
  const t = useTranslation();

  return (
    <Card className={styles.settings}>
      <Tabs defaultValue="general" className={styles.tabs}>
        <TabsList
          aria-label={t("organizations.settingsTitle")}
          className={styles.tabList}
        >
          <TabsTrigger value="general">
            {t("organizations.generalSettings")}
          </TabsTrigger>
          <TabsTrigger value="collection">
            {t("organizations.eventCollection")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className={styles.panel}>
          <GeneralFormContainer organization={organization} />
        </TabsContent>
        <TabsContent value="collection" className={styles.panel}>
          <IgnoredNetworksContainer organizationId={organization.id} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
