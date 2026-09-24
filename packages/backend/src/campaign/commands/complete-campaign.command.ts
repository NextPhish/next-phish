import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type CompleteCampaignInput = { id: string; organizationId: string };
type CompleteCampaignResult = Awaited<
  ReturnType<CampaignRepository["completeCampaign"]>
>;

export class CompleteCampaignCommand implements ICommandHandler<
  CompleteCampaignInput,
  CompleteCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: CompleteCampaignInput) {
    return this.repository.completeCampaign(data.id, data.organizationId);
  }
}
