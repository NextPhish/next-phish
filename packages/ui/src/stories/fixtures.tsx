import { Badge, type ColumnDef } from "../index";
export interface Campaign {
  id: string;
  name: string;
  group: string;
  status: "Running" | "Scheduled" | "Draft" | "Completed";
  recipients: number;
  created: string;
}
export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "September security awareness",
    group: "All employees",
    status: "Running",
    recipients: 480,
    created: "2026-09-10",
  },
  {
    id: "2",
    name: "Password reset simulation",
    group: "Engineering",
    status: "Scheduled",
    recipients: 124,
    created: "2026-09-09",
  },
  {
    id: "3",
    name: "Quarterly invoice review",
    group: "Finance",
    status: "Draft",
    recipients: 36,
    created: "2026-09-08",
  },
  {
    id: "4",
    name: "Cloud account verification",
    group: "Operations",
    status: "Completed",
    recipients: 92,
    created: "2026-09-07",
  },
  {
    id: "5",
    name: "Benefits enrollment",
    group: "People team",
    status: "Completed",
    recipients: 64,
    created: "2026-09-06",
  },
  {
    id: "6",
    name: "Document sharing exercise",
    group: "All employees",
    status: "Draft",
    recipients: 480,
    created: "2026-09-05",
  },
];
export const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <div>
        <strong className="font-semibold">{row.original.name}</strong>
        <div className="text-ui-muted text-xs mt-1">{row.original.group}</div>
      </div>
    ),
  },
  { accessorKey: "group", header: "Target group" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Campaign["status"]>();
      return (
        <Badge
          tone={
            status === "Running" || status === "Completed"
              ? "success"
              : status === "Scheduled"
                ? "info"
                : "neutral"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  { accessorKey: "recipients", header: "Recipients" },
  { accessorKey: "created", header: "Created", enableSorting: false },
];
export const getCampaignId = (row: Campaign) => row.id;

export const campaignFilters: import("../index").TableFilter[] = [
  {
    field: "status",
    label: "Status",
    type: "select",
    options: ["Running", "Scheduled", "Draft", "Completed"].map((value) => ({
      value,
      label: value,
    })),
  },
  { field: "group", label: "Target group", type: "text" },
  { field: "recipients", label: "Recipients (exact)", type: "numeric" },
  { field: "created", label: "Created on", type: "date" },
];
