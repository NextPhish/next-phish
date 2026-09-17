---
title: Dashboard
description: Read simulation activity and find campaigns that need attention.
---

After signing in, select your organization and open **Dashboard**. This is the quickest way to see whether a simulation is running and whether it needs attention. The date range at the top controls which recent activity the summary covers.

[![The NextPhish dashboard showing five summary cards and the engagement funnel](/screenshots/dashboard.jpg)](/screenshots/dashboard.jpg)

_The summary cards, engagement funnel, and attention panel from the demo workspace. Select the image to inspect it at its original size._

## Read the top numbers

| Card                  | What to look for                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Active campaigns**  | Campaigns currently running or waiting for their planned send.                                                                                                                                                          |
| **Target recipients** | People included in campaigns during the selected period.                                                                                                                                                                |
| **Delivery rate**     | The share of targeted recipients with a **Sent** event. This means the sending provider accepted the message; it does not prove inbox placement. If this looks low, inspect the sending profile and recipient timeline. |
| **Risk rate**         | The share of recipients with a click or submit signal. A mail scanner can create clicks, so check [ignored networks](/guides/ignored-networks/) before drawing conclusions.                                             |
| **Reporting rate**    | The share of recipients who reported the simulation through a tracked report action.                                                                                                                                    |

## Follow the funnel

The **engagement funnel** shows how many distinct recipients reached each stage: planned, sent, opened, clicked, submitted, or reported. Each stage has its own meaning; for example, **Sent** means the provider accepted the send, while **Opened** depends on the tracking image being loaded. The numbers are indicators of activity rather than a perfect account of what each person read. See [Events and data](/concepts/events-and-data/) for examples and limitations.

The **Requires attention** area points to operational problems. The **three-month timeline** shows upcoming schedules and campaigns; select an item to open its details.

[![Three-month timeline with upcoming demo campaigns](/screenshots/dashboard-timeline.jpg)](/screenshots/dashboard-timeline.jpg)

_Each bar spans a campaign's planned run. Select a bar or the item beneath it to open the campaign._

## When a number surprises you

1. Open the campaign from the dashboard.
2. In **Statistics**, check whether the issue affects delivery or interactions.
3. In **Recipients**, open one person's timeline to see the exact event and time.
4. For unusual opens or clicks, ask whether a security scanner could have followed the link. For missing sends, check the [sending profile](/app/sending-profiles/) and worker status with your administrator.

New events are processed by the worker, so they may not appear immediately. The dashboard only shows the **selected organization**; use the workspace switcher to see another organization's results.
