import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type MaterializeOccurrenceInput = {
  scheduleId: string;
  sourceCampaignId: string;
  occurrenceAt: Date;
  organizationId: string;
  createdById: string;
};
type MaterializeOccurrenceResult = Awaited<
  ReturnType<CampaignRepository["materializeOccurrence"]>
>;

export class MaterializeOccurrenceCommand implements ICommandHandler<
  MaterializeOccurrenceInput,
  MaterializeOccurrenceResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: MaterializeOccurrenceInput) {
    return this.repository.materializeOccurrence(
      data.scheduleId,
      data.sourceCampaignId,
      data.occurrenceAt,
      data.organizationId,
      data.createdById,
    );
  }
}
