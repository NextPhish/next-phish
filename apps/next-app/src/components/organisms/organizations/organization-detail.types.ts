import type {
  MemberView,
  OrganizationAnalyticsMonth,
  OrganizationView,
} from "@next-phish/backend";
import type { DataTableState, TableStateChange } from "@next-phish/ui";
export interface OrganizationMembersModel {
  rows: MemberView[];
  total: number;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}
export interface OrganizationDetailModel {
  organization: OrganizationView;
  analytics: OrganizationAnalyticsMonth[];
  analyticsLoading: boolean;
  analyticsError: string | null;
  onRetryAnalytics: () => void;
  members: OrganizationMembersModel;
}
