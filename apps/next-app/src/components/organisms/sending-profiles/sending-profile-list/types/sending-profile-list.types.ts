import type { MailSendingProfileView } from "@next-phish/backend";
import type { DataTableState, TableStateChange } from "@next-phish/ui";
import type { TranslationFunction } from "@/src/lib/i18n/shared";

export interface SendingProfileListModel {
  t: TranslationFunction;
  locale: string;
  rows: MailSendingProfileView[];
  total: number;
  state: DataTableState;
  onStateChange: (change: TableStateChange) => void;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  target: MailSendingProfileView | null;
  deleting: boolean;
  deleteError: string;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onAskDelete: (profile: MailSendingProfileView) => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}
