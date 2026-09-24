import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type DeleteScheduleInput = { id: string; organizationId: string };
type DeleteScheduleResult = Awaited<
  ReturnType<CampaignRepository["deleteSchedule"]>
>;

export class DeleteScheduleCommand implements ICommandHandler<
  DeleteScheduleInput,
  DeleteScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: DeleteScheduleInput) {
    return this.repository.deleteSchedule(data.id, data.organizationId);
  }
}
