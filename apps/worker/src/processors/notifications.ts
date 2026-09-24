import type { Job } from "bullmq";
import {
  Container,
  EMAIL_SERVICE_TOKEN,
  renderTemplate,
  type IEmailService,
} from "@next-phish/backend";
import { welcomeUserPayloadSchema } from "@next-phish/shared";

export async function welcomeUser(job: Job) {
  const payload = welcomeUserPayloadSchema.parse(job.data);
  const email = Container.get<IEmailService>(EMAIL_SERVICE_TOKEN);
  await email.send({
    to: payload.email,
    subject: "Welcome to Next Phish",
    html: renderTemplate("welcome-user", {
      name: payload.name,
      magicLink: payload.magicLink,
    }),
  });
}
