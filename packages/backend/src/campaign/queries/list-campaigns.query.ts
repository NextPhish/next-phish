import type { IQueryHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { CampaignStatus, CampaignType } from "../types";

type ListCampaignsInput = {
  organizationId: string;
  type?: CampaignType;
  status?: CampaignStatus;
  search?: string;
  sort?: Array<{
    field: "name" | "type" | "status" | "createdAt" | "updatedAt";
    order: "asc" | "desc";
  }>;
  filters?: { type?: CampaignType; status?: CampaignStatus };
  limit: number;
  offset: number;
};
type ListCampaignsResult = Awaited<
  ReturnType<CampaignRepository["listCampaigns"]>
>;

export class ListCampaignsQuery implements IQueryHandler<
  ListCampaignsInput,
  ListCampaignsResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: ListCampaignsInput) {
    const { organizationId, ...input } = data;
    return this.repository.listCampaigns(organizationId, input);
  }
}
