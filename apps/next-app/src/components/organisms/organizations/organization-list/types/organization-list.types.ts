import type { OrganizationView } from "@next-phish/backend";
import type { DataTableState, TableStateChange } from "@next-phish/ui";

export interface OrganizationListModel {
  organizations: OrganizationView[];
  total: number;
  loading: boolean;
  error?: string;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  onRetry: () => void;
  onManage: (id: string) => void;
  canDeleteOrganization: (organization: OrganizationView) => boolean;
  onDeleteRequest: (organization: OrganizationView) => void;
  deleting: OrganizationView | null;
  deletePending: boolean;
  deleteError?: string;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}
