import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type MaterializeClaimedOccurrenceInput = { occurrenceId: string };
type MaterializeClaimedOccurrenceResult = Awaited<
  ReturnType<CampaignRepository["materializeClaimedOccurrence"]>
>;

export class MaterializeClaimedOccurrenceCommand implements ICommandHandler<
  MaterializeClaimedOccurrenceInput,
  MaterializeClaimedOccurrenceResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: MaterializeClaimedOccurrenceInput) {
    return this.repository.materializeClaimedOccurrence(data.occurrenceId);
  }
}
