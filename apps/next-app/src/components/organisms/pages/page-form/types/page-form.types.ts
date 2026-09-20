export interface PageFormValues {
  name: string;
  path: string | null;
  type: "LANDING" | "REDIRECT";
  status: "DRAFT" | "ACTIVE";
  redirectTarget: "none" | "page" | "url";
  redirectPageId: string | null;
  redirectUrl: string | null;
}
