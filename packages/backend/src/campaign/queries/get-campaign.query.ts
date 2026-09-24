import type { IQueryHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type GetCampaignInput = { id: string; organizationId: string };
type GetCampaignResult = Awaited<ReturnType<CampaignRepository["getCampaign"]>>;

export class GetCampaignQuery implements IQueryHandler<
  GetCampaignInput,
  GetCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: GetCampaignInput) {
    return this.repository.getCampaign(data.id, data.organizationId);
  }
}
