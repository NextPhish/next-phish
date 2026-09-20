"use client";

import type { FormStatus } from "@/src/hooks/use-form-status";
import { IgnoredNetworksView } from "@/src/components/organisms/organization-settings/ignored-networks";

interface IgnoredNetwork {
  id: string;
  network: string;
  normalizedNetwork: string;
  description: string | null;
  createdAt: Date;
}

interface Props {
  networks: IgnoredNetwork[];
  title: string;
  hint: string;
  isLoading: boolean;
  loadError?: string;
  deletingId?: string;
  pendingDeleteId?: string;
  status: FormStatus;
  onDelete: (id: string) => Promise<void>;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onRetry: () => void;
}

/** Global settings reuse the V1 form and confirmation view; only the query scope differs. */
export function GlobalIgnoredNetworksView(props: Props) {
  return <IgnoredNetworksView {...props} />;
}
