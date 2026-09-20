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
  canManage: boolean;
  resendingUserId?: string;
  resendError: string | null;
  onResendWelcome: (userId: string) => Promise<void>;
}
export interface OrganizationDetailModel {
  organization: OrganizationView;
  canManage: boolean;
  analytics: OrganizationAnalyticsMonth[];
  analyticsLoading: boolean;
  analyticsError: string | null;
  onRetryAnalytics: () => void;
  members: OrganizationMembersModel;
}

export type OrganizationDetailState =
  | { status: "loading" }
  | { status: "error"; onRetry: () => void }
  | { status: "not-found" }
  | { status: "ready"; model: OrganizationDetailModel };
