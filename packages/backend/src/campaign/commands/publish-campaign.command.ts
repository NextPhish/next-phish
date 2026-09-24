import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type PublishCampaignInput = { id: string; organizationId: string };
type PublishCampaignResult = Awaited<ReturnType<CampaignRepository["publish"]>>;

export class PublishCampaignCommand implements ICommandHandler<
  PublishCampaignInput,
  PublishCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: PublishCampaignInput) {
    return this.repository.publish(data.id, data.organizationId);
  }
}
