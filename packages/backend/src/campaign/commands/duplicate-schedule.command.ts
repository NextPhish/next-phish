import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type DuplicateScheduleInput = {
  id: string;
  organizationId: string;
  createdById: string;
};
type DuplicateScheduleResult = Awaited<
  ReturnType<CampaignRepository["duplicateSchedule"]>
>;

export class DuplicateScheduleCommand implements ICommandHandler<
  DuplicateScheduleInput,
  DuplicateScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: DuplicateScheduleInput) {
    return this.repository.duplicateSchedule(
      data.id,
      data.organizationId,
      data.createdById,
    );
  }
}
