---
title: Campaigns
description: Assemble assets, choose an audience and manage simulation delivery.
---

Open **Campaigns** to see existing simulations and create a new one. A campaign connects the message, destination page, audience, sender, and schedule. Prepare an [email template](/app/email-templates/), [page](/app/pages/), [sending profile](/app/sending-profiles/), and [target group](/app/target-groups/) first.

For your first run, use a small group of addresses your team controls. Send a test email from the sending profile before scheduling a wider campaign.

[![Focused campaign table with demo campaign names, types, statuses, tags, and search controls](/screenshots/campaigns.jpg)](/screenshots/campaigns.jpg)

_The campaign list distinguishes reusable templates from concrete runs. Open a name to see the run._

## Create a campaign

1. Select **New campaign**. In **General**, enter a name that your team will recognize, such as `September awareness pilot`.
2. Choose **Concrete** for a run with recipients. Choose **Template** only when building reusable material for a future schedule. For a concrete campaign, select the target group and review its member count.
3. Open the asset tabs and choose the email template, landing page, and sending profile. Search and preview each item so you know what recipients will see.
4. If you want to plan the send now, open **Schedule**. Choose the start time and timezone, then a delivery style: **Blast** sends together, **Drip** spreads messages over time, and **Batch** sends in groups.
5. Save the campaign. If an error summary appears, follow its link to the affected tab and correct that field.

A template campaign is a source for future concrete runs, not a sendable campaign with its own recipients or delivery statistics.

When a schedule becomes due, NextPhish creates a separate concrete run and snapshots its selected assets and audience. It then creates durable delivery work for each recipient according to the schedule's pacing policy. See [Scheduling and delivery](/concepts/scheduling-and-delivery/) for the full path from schedule polling through the database outbox, BullMQ and the mail provider.

## Publish and follow a run

Open the campaign details and check the selected audience, sender, message, page, and planned time with a second person. Publish the draft when those are correct. A published concrete campaign exposes a **Schedule** action. Depending on its state, the detail view also offers pause, resume, complete, clone, and delete actions.

Once the run starts, use these views:

[![Statistics tab of a demo campaign showing sent, opened, clicked, submitted, and reported counts](/screenshots/campaign-statistics.jpg)](/screenshots/campaign-statistics.jpg)

_The Statistics tab counts recipients at each stage. The demo values are illustrative._

[![Delivery status chart for the demo campaign](/screenshots/campaign-delivery.jpg)](/screenshots/campaign-delivery.jpg)

_The delivery chart summarizes the current send state. Open **Recipients** to investigate a single person's delivery history._

| View           | Best question to answer                   |
| -------------- | ----------------------------------------- |
| **Overview**   | Is the campaign in the expected state?    |
| **Statistics** | How many recipients reached each stage?   |
| **Recipients** | What happened to one recipient, and when? |

In **Recipients**, open a row to inspect its timeline. **Sent** means the sending provider accepted the message; it does not guarantee delivery to the mailbox. **Opened** means the tracking image loaded; **Clicked** means a tracked link or landing page was followed; **Submitted** means the practice page's submit action was used. A separate delivery timeline can show provider statuses such as **Delivered**, **Bounced**, or **Rejected**. **Delivery unknown** means NextPhish cannot safely determine whether the provider accepted the message, so it avoids an automatic retry that could create a duplicate. See [Events and data](/concepts/events-and-data/) for how these events are recorded and why opens or clicks sometimes come from scanners.

If the campaign stays pending, ask an administrator to check the worker, schedule timezone, delivery setting, and mail provider. If messages are sent but do not reach inboxes, see [Mail allowlisting](/guides/mail-allowlisting/). If clicks appear before anyone opens the test message, see [Ignored networks](/guides/ignored-networks/).

Delivery requires a running worker, `DELIVERY_ENABLED=true`, reachable Redis and PostgreSQL services, a reachable sending provider and a public content origin accessible to recipients. Queue processing is durable and guarded against duplicate work, but it is not an exactly-once guarantee across the database, Redis and SMTP. For a local walkthrough, see [Local development](/guides/local-development/).
