import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { CampaignDefinitionInput } from "../validations";

type UpdateCampaignInput = {
  id: string;
  organizationId: string;
  data: CampaignDefinitionInput;
};
type UpdateCampaignResult = Awaited<
  ReturnType<CampaignRepository["updateCampaign"]>
>;

export class UpdateCampaignCommand implements ICommandHandler<
  UpdateCampaignInput,
  UpdateCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: UpdateCampaignInput) {
    return this.repository.updateCampaign(
      data.id,
      data.organizationId,
      data.data,
    );
  }
}
