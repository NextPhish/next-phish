"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/src/lib/i18n/client";
import { useRouter } from "next/navigation";
import { trpc } from "@/src/lib/trpc";
import { authClient } from "@/src/lib/auth-client";
import type { OrganizationView } from "@next-phish/backend";

interface UseMyOrganizationsOptions {
  search?: string;
  limit?: number;
  offset?: number;
  initialData?: {
    organizations: OrganizationView[];
    total: number;
  };
}

export function useMyOrganizations(options: UseMyOrganizationsOptions = {}) {
  const router = useRouter();
  const t = useTranslation();
  const switching = useRef(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.organization.list.useQuery(
    {
      search: options.search,
      limit: options.limit ?? 50,
      offset: options.offset ?? 0,
    },
    {
      initialData: options.initialData,
      staleTime: options.initialData ? 5 * 60 * 1000 : undefined,
    },
  );

  const { data: activeOrg } = authClient.useActiveOrganization();

  const create = trpc.organization.create.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate();
    },
  });

  async function setActive(organizationId: string) {
    if (switching.current) return;
    switching.current = true;
    setIsSwitching(true);
    setSwitchError("");
    try {
      const result = await authClient.organization.setActive({
        organizationId,
      });
      if (result.error) throw new Error(t("nav.switchOrganizationError"));
      router.refresh();
    } catch (error) {
      setSwitchError(t("nav.switchOrganizationError"));
      throw error;
    } finally {
      switching.current = false;
      setIsSwitching(false);
    }
  }

  return {
    organizations: data?.organizations ?? [],
    total: data?.total ?? 0,
    isLoading,
    activeOrg,
    isSwitching,
    switchError,
    create,
    setActive,
  };
}
