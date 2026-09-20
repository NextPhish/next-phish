"use client";

import { usePathname } from "next/navigation";
import type { NavigationGroup } from "@next-phish/ui";
import type { OrganizationView } from "@next-phish/backend";
import {
  Building2,
  CalendarDays,
  CheckSquare2,
  FileText,
  Gauge,
  Mail,
  Send,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { canManageOrganizations } from "@/src/lib/organization-helpers";
import { useTranslation } from "@/src/lib/i18n";

interface Options {
  role?: string | null;
  organizations: OrganizationView[];
}

export function useSidebarNavigation({ role, organizations }: Options) {
  const t = useTranslation();
  const pathname = usePathname();
  const navigation: NavigationGroup[] = [
    {
      id: "overview",
      items: [
        {
          id: "dashboard",
          label: t("common.dashboard"),
          href: "/",
          icon: <Gauge size={18} />,
        },
      ],
    },
    {
      id: "planning",
      label: t("nav.planning"),
      items: [
        {
          id: "tasks",
          label: t("nav.tasks"),
          href: "/tasks",
          icon: <CheckSquare2 size={18} />,
        },
        {
          id: "schedule",
          label: t("nav.schedule"),
          href: "/schedule",
          icon: <CalendarDays size={18} />,
        },
      ],
    },
    {
      id: "simulations",
      label: t("nav.simulations"),
      items: [
        {
          id: "campaigns",
          label: t("nav.campaigns"),
          href: "/campaigns",
          icon: <Zap size={18} />,
        },
        {
          id: "pages",
          label: t("nav.pages"),
          href: "/pages",
          icon: <FileText size={18} />,
        },
        {
          id: "email-templates",
          label: t("nav.emailTemplates"),
          href: "/email-templates",
          icon: <Mail size={18} />,
        },
        {
          id: "sending-profiles",
          label: t("nav.sendingProfiles"),
          href: "/sending-profiles",
          icon: <Send size={18} />,
        },
        {
          id: "target-groups",
          label: t("nav.targetGroups"),
          href: "/target-groups",
          icon: <Users size={18} />,
        },
      ],
    },
  ];
  if (canManageOrganizations(organizations))
    navigation.push({
      id: "management",
      label: t("nav.management"),
      items: [
        {
          id: "organizations",
          label: t("nav.organizations"),
          href: "/organizations",
          icon: <Building2 size={18} />,
        },
      ],
    });
  if (role === "admin")
    navigation.push({
      id: "administration",
      label: t("nav.administration"),
      items: [
        {
          id: "users",
          label: t("nav.users"),
          href: "/users",
          icon: <Users size={18} />,
        },
        {
          id: "settings",
          label: t("common.settings"),
          href: "/settings",
          icon: <Settings size={18} />,
        },
      ],
    });

  const active = navigation
    .flatMap((group) => group.items)
    .find((item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
  return {
    navigation,
    activeItem: active?.id ?? "",
    activeLabel:
      active?.label ??
      (pathname === "/profile"
        ? t("settings.accountTitle")
        : t("common.dashboard")),
  };
}
