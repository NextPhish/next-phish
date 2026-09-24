import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type DeleteCampaignInput = { id: string; organizationId: string };
type DeleteCampaignResult = Awaited<
  ReturnType<CampaignRepository["deleteCampaign"]>
>;

export class DeleteCampaignCommand implements ICommandHandler<
  DeleteCampaignInput,
  DeleteCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: DeleteCampaignInput) {
    return this.repository.deleteCampaign(data.id, data.organizationId);
  }
}
