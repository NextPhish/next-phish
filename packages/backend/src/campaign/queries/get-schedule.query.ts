import type { IQueryHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type GetScheduleInput = { id: string; organizationId: string };
type GetScheduleResult = Awaited<ReturnType<CampaignRepository["getSchedule"]>>;

export class GetScheduleQuery implements IQueryHandler<
  GetScheduleInput,
  GetScheduleResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: GetScheduleInput) {
    return this.repository.getSchedule(data.id, data.organizationId);
  }
}
