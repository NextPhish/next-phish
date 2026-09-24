import { router } from "./procedures";
import { userRouter } from "./routers/user.router";
import { organizationRouter } from "./routers/organization.router";
import { emailTemplateRouter } from "./routers/email-template.router";
import { fileRouter } from "./routers/file.router";
import { pageRouter } from "./routers/page.router";
import { jobRouter } from "./routers/job.router";
import { apiKeyRouter } from "./routers/api-key.router";
import { targetGroupRouter } from "./routers/target-group.router";
import { mailSendingRouter } from "./routers/mail-sending.router";
import { campaignRouter } from "./routers/campaign.router";
import { taskRouter } from "./routers/task.router";
import { settingsRouter } from "./routers/settings.router";

export const appRouter = router({
  user: userRouter,
  organization: organizationRouter,
  emailTemplate: emailTemplateRouter,
  file: fileRouter,
  page: pageRouter,
  job: jobRouter,
  apiKey: apiKeyRouter,
  targetGroup: targetGroupRouter,
  mailSending: mailSendingRouter,
  campaign: campaignRouter,
  task: taskRouter,
  settings: settingsRouter,
});
export type AppRouter = typeof appRouter;
