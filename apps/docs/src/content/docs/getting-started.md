---
title: Get started
description: The shortest path from a fresh NextPhish instance to a safe test campaign.
---

NextPhish helps your organization run **authorized phishing simulations** and learn from the results. You prepare a practice email and landing page, choose a group of people who have agreed to be part of the program, schedule the campaign, then review what happened. Most day-to-day tasks happen in the web app; you do not need to write code.

The screenshots in this handbook use the English interface and a local demo workspace. Each image focuses on the relevant controls; select it to open at its original size.

## Choose your path

- **Using an existing NextPhish installation?** Start with the [dashboard](/app/dashboard/) and the first-campaign walkthrough below.
- **Setting up a test installation?** Follow [Local development](/guides/local-development/). It includes the commands for the person who manages the server.
- **Preparing a real installation?** Give [Production deployment](/guides/production/) to your deployment administrator and [Mail allowlisting](/guides/mail-allowlisting/) to your mail administrator.
- **Working with an AI assistant?** Follow [Connect an AI assistant with MCP](/guides/mcp/) to grant controlled access to NextPhish tools.

## Your first small campaign

1. **Choose a workspace.** Sign in and select your organization from the workspace switcher. An administrator creates the first organization during setup.
2. **Prepare the sender.** Create a [sending profile](/app/sending-profiles/) and use its test-email action. For a local installation, the mail appears in the SMTP capture inbox instead of going to a real person.
3. **Prepare the message and destination.** Create an [email template](/app/email-templates/) and a [landing page](/app/pages/). Preview both before using them.
4. **Choose a small audience.** Create a [target group](/app/target-groups/) with only authorized test addresses. Double-check every address before sending.
5. **Create the campaign.** Choose **Concrete** in [Campaigns](/app/campaigns/), select the four resources above, save, then publish and schedule it.
6. **Follow the results.** Open the campaign's **Recipients** and **Statistics** views. The [events guide](/concepts/events-and-data/) explains what _sent_, _opened_, _clicked_, and _submitted_ mean.

Start with a handful of test recipients. A **Template** campaign is a reusable source for future schedules; it does not send mail directly or have its own recipient results.

## Useful words

| Term                  | Plain-English meaning                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Sending profile**   | The mail service and sender address used to send campaign messages.                 |
| **Email template**    | The practice message a recipient will see.                                          |
| **Landing page**      | The practice page a tracked link opens.                                             |
| **Target group**      | The list of people included in a campaign.                                          |
| **Concrete campaign** | A real run with selected people, assets, and a send time.                           |
| **Ignored network**   | An IP address or range whose scanner/test interactions should not count in results. |

If your team uses mail security scanners, read [Ignored networks](/guides/ignored-networks/) before interpreting click and open counts.
