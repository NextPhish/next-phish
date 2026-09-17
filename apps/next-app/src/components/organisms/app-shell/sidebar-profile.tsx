"use client";

import Link from "next/link";
import { LogOut, UserRound, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/src/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@next-phish/ui";
import styles from "./app-shell.module.css";

interface SidebarProfileProps {
  user: { name: string; email: string; image?: string | null };
}

export function SidebarProfile({ user }: SidebarProfileProps) {
  const t = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={styles.profileTrigger}
          aria-label={`${t("settings.accountTitle")}: ${user.name}`}
        >
          <span
            className={styles.avatar}
            style={
              user.image ? { backgroundImage: `url(${user.image})` } : undefined
            }
            aria-hidden="true"
          >
            {user.image ? null : user.name.charAt(0).toUpperCase()}
          </span>
          <span className={styles.triggerIdentity}>
            <strong>{user.name}</strong>
            <span>{t("settings.account")}</span>
          </span>
          <ChevronsUpDown
            size={15}
            className={styles.triggerChevron}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start">
        <DropdownMenuLabel>
          <strong className={styles.menuUserName}>{user.name}</strong>
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" prefetch={false}>
            <UserRound size={16} aria-hidden="true" />
            {t("settings.account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/api/signout" method="post">
          <DropdownMenuItem
            asChild
            onSelect={(event) => event.preventDefault()}
          >
            <button type="submit">
              <LogOut size={16} aria-hidden="true" />
              {t("common.signOut")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
