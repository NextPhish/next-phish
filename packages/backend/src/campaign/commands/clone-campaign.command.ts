import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { CampaignType } from "../types";

type CloneCampaignInput = {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  type: CampaignType;
  targetGroupId: string | null;
};
type CloneCampaignResult = Awaited<
  ReturnType<CampaignRepository["cloneCampaign"]>
>;

export class CloneCampaignCommand implements ICommandHandler<
  CloneCampaignInput,
  CloneCampaignResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: CloneCampaignInput) {
    const { id, organizationId, createdById, ...input } = data;
    return this.repository.cloneCampaign(
      id,
      organizationId,
      createdById,
      input,
    );
  }
}
