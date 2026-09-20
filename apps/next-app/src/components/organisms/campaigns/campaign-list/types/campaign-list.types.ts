export type CampaignRow = {
  id: string;
  name: string;
  tags: string[];
  type: "TEMPLATE" | "CONCRETE";
  status: string;
  targetTimezone: string;
  updatedAt: Date;
  emailTemplate: { name: string } | null;
  page: { name: string } | null;
  targetGroup: { name: string; _count: { users: number } } | null;
};
