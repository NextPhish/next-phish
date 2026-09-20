"use client";

import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@next-phish/ui";
import type { OrganizationView } from "@next-phish/backend";
import { useTranslation } from "@/src/lib/i18n";
import { GeneralSettings } from "./general-settings";
import { IgnoredNetworks } from "./ignored-networks";

interface OrganizationSettingsProps {
  organization: OrganizationView;
}

export function OrganizationSettings({
  organization,
}: OrganizationSettingsProps) {
  const t = useTranslation();

  return (
    <Card className="text-[var(--np-text)]">
      <Tabs defaultValue="general" className="min-w-0">
        <TabsList
          aria-label={t("organizations.settingsTitle")}
          className="mb-0 px-6 max-[760px]:px-[18px]"
        >
          <TabsTrigger value="general">
            {t("organizations.generalSettings")}
          </TabsTrigger>
          <TabsTrigger value="collection">
            {t("organizations.eventCollection")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="p-6 max-[760px]:px-[18px]">
          <GeneralSettings organization={organization} />
        </TabsContent>
        <TabsContent value="collection" className="p-6 max-[760px]:px-[18px]">
          <IgnoredNetworks organizationId={organization.id} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
