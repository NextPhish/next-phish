import type { Job } from "bullmq";
import {
  Container,
  ProcessSiteImportCommand,
  ImportTargetGroupUsersCommand,
} from "@next-phish/backend";

export function importSite(job: Job) {
  return Container.get(ProcessSiteImportCommand).execute({
    jobId: String(job.data.jobId),
  });
}

export function importTargetGroup(job: Job) {
  return Container.get(ImportTargetGroupUsersCommand).execute({
    jobId: String(job.data.jobId),
  });
}
