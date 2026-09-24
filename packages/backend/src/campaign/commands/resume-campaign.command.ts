import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type ResumeCampaignInput = { id: string; organizationId: string };
type ResumeCampaignResult = Awaited<
  ReturnType<CampaignRepository["resumeCampaign"]>
>;

export class ResumeCampaignCommand implements ICommandHandler<
  ResumeCampaignInput,
  ResumeCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: ResumeCampaignInput) {
    return this.repository.resumeCampaign(data.id, data.organizationId);
  }
}
