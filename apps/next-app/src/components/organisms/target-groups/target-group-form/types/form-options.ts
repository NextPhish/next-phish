export interface TargetGroupFormOptions {
  mode?: "create" | "edit";
  groupId?: string;
  initialName?: string;
  initialStatus?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  onSuccess?: () => void;
}
