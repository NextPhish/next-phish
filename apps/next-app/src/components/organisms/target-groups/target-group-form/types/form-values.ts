export interface FormUser {
  _key: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
}

export interface TargetGroupFormValues {
  name: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  users: FormUser[];
}
