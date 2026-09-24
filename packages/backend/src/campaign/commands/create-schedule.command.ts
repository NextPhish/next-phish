import type { ICommandHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";
import type { ScheduleDefinitionInput } from "../validations";

type CreateScheduleInput = ScheduleDefinitionInput & {
  organizationId: string;
  createdById: string;
};
type CreateScheduleResult = Awaited<
  ReturnType<CampaignRepository["createSchedule"]>
>;

export class CreateScheduleCommand implements ICommandHandler<
  CreateScheduleInput,
  CreateScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: CreateScheduleInput) {
    const { organizationId, createdById, ...input } = data;
    return this.repository.createSchedule(
      organizationId,
      createdById,
      input as ScheduleDefinitionInput,
    );
  }
}
