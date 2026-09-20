---
title: Schedules
description: Plan one-time or recurring campaign runs.
---

A **schedule** decides when a campaign runs and whether it repeats. Use it after the campaign's content and audience have been checked. A one-time schedule is suitable for a pilot; a recurring schedule is suitable for an ongoing program.

Each due occurrence creates a new concrete campaign run from the selected source. The schedule remains the reusable timing policy; the run receives its own snapshot of assets, recipients and delivery history. [Scheduling and delivery](/concepts/scheduling-and-delivery/) explains this workflow, including polling, missed occurrences and the delivery queue.

[![New schedule details form with source campaign, audience, timezone, and first occurrence](/screenshots/schedules.jpg)](/screenshots/schedules.jpg)

_First select the campaign source, audience, timezone, and first occurrence._

[![Delivery pacing and automatic completion sections of the schedule form](/screenshots/schedule-completion.jpg)](/screenshots/schedule-completion.jpg)

_Farther down the same form, choose delivery pacing and whether to complete the campaign automatically._

## Plan a run

1. Open **Schedule → New schedule** and give it a name that describes the audience and cadence.
2. Choose **One-time** for one source campaign or **Recurring** for one or more template campaigns. A one-time concrete campaign may already have its target group; select a group when the form asks for one.
3. Choose the **timezone** and first occurrence. Read the displayed local time before saving, especially if the team works across regions. For recurring schedules, set the recurrence and confirm the next planned occurrence.
4. Choose delivery pacing: **Blast** sends together, **Drip** spreads messages over time, and **Batch** sends groups of messages. Select the option approved for the exercise and your mail provider's capacity.
5. Save, then open the detail view. Review the source campaign, audience, next occurrence and delivery settings with another team member before the first send.

The displayed time is interpreted in the selected timezone. A worker polls for due work, so a healthy run can begin shortly after the exact displayed second. If the worker was unavailable across several recurring intervals, NextPhish keeps the latest due occurrence rather than sending every missed interval.

The overview shows upcoming work, a timeline and delivery health. If a run does not start, check the schedule's status and timezone first. Then ask an administrator to check the worker, Redis, outbox health and whether campaign delivery is enabled. [Campaigns](/app/campaigns/) explains what happens after a schedule creates a run.
