import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { CampaignDefinitionInput } from "../validations";

type CreateCampaignInput = CampaignDefinitionInput & {
  organizationId: string;
  createdById: string;
};
type CreateCampaignResult = Awaited<
  ReturnType<CampaignRepository["createCampaign"]>
>;

export class CreateCampaignCommand implements ICommandHandler<
  CreateCampaignInput,
  CreateCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: CreateCampaignInput) {
    const { organizationId, createdById, ...input } = data;
    return this.repository.createCampaign(
      organizationId,
      createdById,
      input as CampaignDefinitionInput,
    );
  }
}
