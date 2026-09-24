import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { ScheduleDefinitionInput } from "../validations";

type UpdateScheduleInput = {
  id: string;
  organizationId: string;
  data: ScheduleDefinitionInput;
};
type UpdateScheduleResult = Awaited<
  ReturnType<CampaignRepository["updateSchedule"]>
>;

export class UpdateScheduleCommand implements ICommandHandler<
  UpdateScheduleInput,
  UpdateScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: UpdateScheduleInput) {
    return this.repository.updateSchedule(
      data.id,
      data.organizationId,
      data.data,
    );
  }
}
