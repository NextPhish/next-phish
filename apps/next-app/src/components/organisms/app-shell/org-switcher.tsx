"use client";

import { useRef, useState } from "react";
import { Building2, Plus, ChevronsUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Skeleton,
} from "@next-phish/ui";
import { useMyOrganizations } from "@/src/hooks/use-my-organizations";
import { CreateOrgModal } from "./create-org-modal";
import { useTranslation } from "@/src/lib/i18n";
import type { OrganizationView } from "@next-phish/backend";
import styles from "./app-shell.module.css";

interface OrgSwitcherProps {
  organizations?: OrganizationView[];
  organizationTotal?: number;
}

export function OrgSwitcher({
  organizations: initialOrganizations,
  organizationTotal,
}: OrgSwitcherProps) {
  const t = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { organizations, activeOrg, setActive, isLoading } = useMyOrganizations(
    {
      limit: 100,
      initialData: initialOrganizations
        ? {
            organizations: initialOrganizations,
            total: organizationTotal ?? initialOrganizations.length,
          }
        : undefined,
    },
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const canCreate = organizations.some(
    (organization) => organization.$me.role === "owner",
  );
  const selectedId = organizations.some(
    (organization) => organization.id === activeOrg?.id,
  )
    ? activeOrg?.id
    : "";

  if (isLoading)
    return (
      <div role="status">
        <span className="np-sr-only">{t("common.loading")}</span>
        <Skeleton className={styles.organizationSkeleton} />
      </div>
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            ref={triggerRef}
            className={styles.organizationTrigger}
            aria-label={t("nav.selectOrganization")}
          >
            <span className={styles.organizationIcon}>
              <Building2 size={18} aria-hidden="true" />
            </span>
            <span className={styles.triggerIdentity}>
              <strong>
                {organizations.find(
                  (organization) => organization.id === selectedId,
                )?.name ?? t("nav.selectOrganization")}
              </strong>
              <span>
                {organizations.find(
                  (organization) => organization.id === selectedId,
                )?.$me.role === "owner"
                  ? t("organizations.ownerBadge")
                  : t("nav.workspace")}
              </span>
            </span>
            <ChevronsUpDown
              size={15}
              className={styles.triggerChevron}
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(event) => {
            if (showCreateModal) event.preventDefault();
          }}
        >
          <DropdownMenuLabel>{t("nav.selectOrganization")}</DropdownMenuLabel>
          {organizations.map((organization) => (
            <DropdownMenuItem
              key={organization.id}
              onSelect={() => {
                if (organization.id !== selectedId)
                  void setActive(organization.id);
              }}
            >
              <Building2 size={16} aria-hidden="true" />
              <span className={styles.menuOrganizationName}>
                {organization.name}
              </span>
              {organization.id === selectedId && (
                <Check size={16} aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
          {canCreate && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowCreateModal(true)}>
                <Plus size={16} aria-hidden="true" />
                {t("nav.newOrganization")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrgModal
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        visible={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />
    </>
  );
}
