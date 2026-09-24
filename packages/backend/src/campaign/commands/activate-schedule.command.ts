import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type ActivateScheduleInput = { id: string; organizationId: string };
type ActivateScheduleResult = Awaited<
  ReturnType<CampaignRepository["activateSchedule"]>
>;

export class ActivateScheduleCommand implements ICommandHandler<
  ActivateScheduleInput,
  ActivateScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: ActivateScheduleInput) {
    return this.repository.activateSchedule(data.id, data.organizationId);
  }
}
