import type { IQueryHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type ListSchedulesInput = {
  organizationId: string;
  search?: string;
  sort?: Array<{
    field: "name" | "type" | "status" | "startsAt";
    order: "asc" | "desc";
  }>;
  filters?: {
    type?: "ONE_TIME" | "RECURRING";
    status?: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  };
  limit: number;
  offset: number;
};
type ListSchedulesResult = Awaited<
  ReturnType<CampaignRepository["listSchedules"]>
>;

export class ListSchedulesQuery implements IQueryHandler<
  ListSchedulesInput,
  ListSchedulesResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: ListSchedulesInput) {
    const { organizationId, ...input } = data;
    return this.repository.listSchedules(organizationId, input);
  }
}
