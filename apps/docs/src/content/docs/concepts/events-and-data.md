---
title: Events and data
description: Understand what NextPhish measures, what it stores, and how to read the results.
---

A **campaign event** is a timestamped step in one recipient's simulation. You can see these steps in a campaign's **Recipients** view. The dashboard combines events across recipients to show trends. This page explains the words used there so you can interpret the numbers without knowing how the system is built.

[![Campaign statistics in the demo workspace showing the main interaction stages](/screenshots/campaign-statistics.jpg)](/screenshots/campaign-statistics.jpg)

_A demo campaign's Statistics tab: the number before the slash is the count of recipients who reached that stage._

## What the events mean

| Event         | When it appears                                                    | What it tells you                                                                                             |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Scheduled** | A recipient is planned for a send time.                            | The message is in the campaign plan; it has not necessarily left the system.                                  |
| **Sent**      | The sending provider accepts the message from NextPhish.           | The message was handed to the provider, but this alone does not prove it reached the inbox.                   |
| **Opened**    | The recipient's mail client requests the tiny tracking image.      | The image was loaded. Some clients block images; security tools may load them automatically.                  |
| **Clicked**   | A tracked link is followed or the campaign landing page is opened. | Someone or something followed the link. Mail scanners can follow links too.                                   |
| **Submitted** | The simulation page's submit action is used.                       | A form or submit-like button was used. The tracking handler records the action, not the entered field values. |
| **Reported**  | A report action reaches the tracking endpoint.                     | The simulation was reported through an integrated report action.                                              |
| **Failed**    | NextPhish records a failed send.                                   | Open the recipient timeline and delivery details to investigate.                                              |

The **delivery timeline** has additional technical states, such as **Queued**, **Dispatch started**, **Accepted**, **Delivered**, **Deferred**, **Bounced**, **Rejected**, **Retry scheduled**, **Delivery unknown**, and **Cancelled**. These describe the sending pipeline and provider feedback. **Delivered** requires a provider delivery event; an **Accepted** or **Sent** event is not proof of inbox placement. **Delivery unknown** means the outcome could not be confirmed, so it should be checked with the provider before sending again.

### Why counts may differ

- The dashboard counts unique recipients at each stage. It does not count every image request or every click as a new person.
- Events are queued and processed by the worker. A recent action may take a short time to appear.
- Image blocking, link scanners, forwarded messages, and shared devices can affect open or click measurements. Treat them as indicators, not a verdict on an individual.
- An [ignored network](/guides/ignored-networks/) prevents **Opened**, **Clicked**, and **Submitted** activity from matching IP addresses from changing the campaign results. **Reported** is still recorded.

## What data is stored

NextPhish keeps the target group's recipient details needed to send and personalize a campaign: email address, first name, last name, optional position, and any supplied merge data. A campaign copies these values into a recipient snapshot when it runs. It also stores delivery status, message identifiers, scheduled and sent times, and the recipient's event history.

Each campaign event stores the event type, time, and a reference to its campaign, organization, and recipient. The public tracking request records the requesting **IP address temporarily** so the worker can check ignored networks. The processed campaign event does **not** contain an IP field. The current cleanup job removes processed tracking requests after the configured outbox retention period, which defaults to **7 days**. Delivery event history defaults to **90 days**; delivery attempts default to **30 days**. Campaign recipient records and campaign event history have no separate automatic time limit in the current implementation and are removed when their campaign is deleted.

The landing-page submission endpoint records that a submit action happened. It does not parse or retain submitted request bodies. The page script normally sends the event without the form field values. Design simulations so they do not ask people to enter real passwords or other sensitive information.

## Who can see the results?

The management app limits campaign data to the selected organization and checks the signed-in user's permissions. People with access to a campaign can inspect its recipient timeline. Before launching a simulation, decide who in your team needs that access and how long you will keep campaign results.

For the walkthrough, go to [Campaigns](/app/campaigns/) and open a concrete campaign, then choose its **Recipients** and **Statistics** views.
