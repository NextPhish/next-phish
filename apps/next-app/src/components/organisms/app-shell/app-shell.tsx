"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell as V1AppShell, Select } from "@next-phish/ui";
import type { OrganizationView } from "@next-phish/backend";
import { Languages, Settings } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/src/lib/constants";
import { useLocale, useSetLocale, useTranslation } from "@/src/lib/i18n";
import { OrgSwitcher } from "./org-switcher";
import { SidebarProfile } from "./sidebar-profile";
import { useSidebarNavigation } from "./sidebar-menu";
import styles from "./app-shell.module.css";

const EMPTY_ORGANIZATIONS: OrganizationView[] = [];

interface AppShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
  organizations?: OrganizationView[];
  organizationTotal?: number;
  children: React.ReactNode;
}

function HeaderActions() {
  const t = useTranslation();
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div className={styles.headerActions}>
      <Languages size={17} aria-hidden="true" />
      <Select
        aria-label={t("settings.selectLanguage")}
        value={locale}
        onValueChange={(value) => setLocale(value as typeof locale)}
        options={SUPPORTED_LANGUAGES}
        className={styles.languageSelect}
      />
      <Link
        href="/profile"
        prefetch={false}
        className={styles.settingsLink}
        aria-label={t("settings.accountTitle")}
      >
        <Settings size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function AppShell({
  user,
  organizations = EMPTY_ORGANIZATIONS,
  organizationTotal,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const { navigation, activeItem, activeLabel } = useSidebarNavigation({
    role: user.role,
    organizations,
  });

  return (
    <div
      className={
        pathname === "/" ||
        pathname === "/profile" ||
        pathname === "/tasks" ||
        pathname === "/schedule" ||
        pathname.startsWith("/schedule/") ||
        pathname === "/organizations" ||
        pathname.startsWith("/organizations/")
          ? styles.v1Boundary
          : styles.legacyBoundary
      }
    >
      <V1AppShell
        navigation={navigation}
        navigationKey={pathname}
        activeItem={activeItem}
        linkComponent={Link}
        breadcrumb={
          <>
            <span className={styles.breadcrumbRoot}>{t("nav.workspace")}</span>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            <span className={styles.currentBreadcrumb}>{activeLabel}</span>
          </>
        }
        organization={
          <OrgSwitcher
            organizations={organizations}
            organizationTotal={organizationTotal}
          />
        }
        profile={<SidebarProfile user={user} />}
        headerActions={<HeaderActions />}
        labels={{
          navigation: t("nav.mainNavigation"),
          open: t("nav.openSidebar"),
          close: t("nav.closeSidebar"),
          skip: t("nav.skipToContent"),
        }}
      >
        {children}
      </V1AppShell>
    </div>
  );
}
