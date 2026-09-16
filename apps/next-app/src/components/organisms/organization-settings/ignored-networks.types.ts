import type { FormStatus } from "@/src/hooks/use-form-status";

export interface IgnoredNetwork {
  id: string;
  network: string;
  normalizedNetwork: string;
  description: string | null;
  createdAt: Date;
}

export interface IgnoredNetworksPresentationProps {
  networks: IgnoredNetwork[];
  title?: string;
  hint?: string;
  isLoading: boolean;
  loadError?: string;
  deletingId?: string;
  pendingDeleteId?: string;
  status: FormStatus;
  onDelete: (id: string) => Promise<void>;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onRetry?: () => void;
}
