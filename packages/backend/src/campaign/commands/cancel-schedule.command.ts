import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type CancelScheduleInput = { id: string; organizationId: string };
type CancelScheduleResult = Awaited<
  ReturnType<CampaignRepository["cancelSchedule"]>
>;

export class CancelScheduleCommand implements ICommandHandler<
  CancelScheduleInput,
  CancelScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: CancelScheduleInput) {
    return this.repository.cancelSchedule(data.id, data.organizationId);
  }
}
