import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type PauseCampaignInput = { id: string; organizationId: string };
type PauseCampaignResult = Awaited<
  ReturnType<CampaignRepository["pauseCampaign"]>
>;

export class PauseCampaignCommand implements ICommandHandler<
  PauseCampaignInput,
  PauseCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: PauseCampaignInput) {
    return this.repository.pauseCampaign(data.id, data.organizationId);
  }
}
