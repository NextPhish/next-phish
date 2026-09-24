import type { IQueryHandler } from "../../message-bus";
import { CampaignRepository } from "../repositories";

type GetScheduleTimelineInput = {
  organizationId: string;
  startsAt: Date;
  endsAt: Date;
};
type GetScheduleTimelineResult = Awaited<
  ReturnType<CampaignRepository["getScheduleTimeline"]>
>;

export class GetScheduleTimelineQuery implements IQueryHandler<
  GetScheduleTimelineInput,
  GetScheduleTimelineResult
> {
  constructor(private readonly repository: CampaignRepository) {}

  execute(data: GetScheduleTimelineInput) {
    return this.repository.getScheduleTimeline(
      data.organizationId,
      data.startsAt,
      data.endsAt,
    );
  }
}
