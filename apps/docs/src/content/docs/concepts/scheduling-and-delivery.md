---
title: Scheduling and delivery
description: How a planned simulation becomes recipient email, and how NextPhish handles delays and failures.
---

Scheduling and delivery happen in several durable steps. This separation lets NextPhish recover from a worker restart or a temporarily unavailable mail provider without losing the plan stored in PostgreSQL.

The central distinction is:

- A **template campaign** is reusable source material. It points to the email, page and sending profile that a schedule can use.
- A **schedule** is the recurrence and delivery policy: when to run, which source to select, which audience to use, and whether to send in blast, drip or batch mode.
- A **campaign run** is a concrete snapshot created for one schedule occurrence. It owns its recipient records, tracking references and delivery history.

A recurring schedule therefore does not keep sending one mutable campaign. Each occurrence materializes a new concrete run from the selected source.

## From local time to a campaign run

The schedule stores a timezone and its next occurrence as a precise instant. Recurrence calculations use the schedule timezone, including daylight-saving transitions. The displayed local time is the intent; the stored due instant is what workers compare with the current time.

By default, a single schedule worker polls every 10 seconds and claims up to 50 due schedules. Database row locks with `SKIP LOCKED` prevent two pollers from claiming the same schedule simultaneously. These values are configurable, so an occurrence may begin shortly after its due time rather than at the exact second shown in the UI.

For a recurring schedule that was offline through several due times, the current catch-up policy retains the latest due occurrence and advances the next occurrence into the future. It does not send every missed interval. A one-time schedule completes after its occurrence. A recurring schedule also completes when its end date, maximum campaign count or source-deck limit is reached.

Claiming a due occurrence and recording its **materialization outbox event** happen in the same PostgreSQL transaction. A separate worker turns that event into a BullMQ job. The materialization job then:

1. validates that the selected source assets and target group are still available;
2. creates one concrete campaign run for the schedule and occurrence;
3. snapshots the email template, landing page, sending profile, attachments and target group;
4. creates stable recipient rows in bounded batches; and
5. calculates each recipient's send time from the occurrence and the blast, drip or batch policy.

The unique schedule-and-occurrence key makes materialization resumable and prevents a second campaign run for the same occurrence. A five-minute materialization lease protects work in progress; expired materialization is marked failed so it can be inspected and retried by the queue flow.

## Why there is an outbox

Think of the outbox as a saved to-do list for background workers. Saving a plan also saves the instruction to carry it out. Closing the browser does not stop that work; the worker service must remain running.

PostgreSQL and Redis cannot participate in one shared transaction. Writing a campaign row and immediately publishing a Redis job would leave a gap: the database commit could succeed while Redis is unavailable, or Redis could receive a job before the database commit succeeds.

NextPhish uses a **transactional outbox** to close that gap:

1. The application changes durable state and inserts an `outbox_event` in the same database transaction.
2. By default, the outbox publisher polls every 5 seconds and claims up to 100 available rows with database locks.
3. It publishes each row to the appropriate BullMQ queue with a stable job ID derived from the outbox deduplication key.
4. Only after BullMQ accepts the job does it mark the outbox row published.
5. A publish failure returns the row to the outbox with a 30-second delay. A publishing claim older than five minutes can be reclaimed.

This design is durable, but it is not an exactly-once promise. A process can stop after BullMQ accepts a job and before the outbox row is acknowledged. Stable job IDs, unique database keys, leases and conditional state transitions make repeated publication and repeated handling safe where the workflow expects them.

## From a campaign run to SMTP

A delivery feeder scans for planned recipients whose send time falls within a near-term horizon. The defaults are a 10-second feed interval, a five-minute horizon and a batch of up to 500 recipients. It interleaves organizations before applying the batch limit so one large tenant is less likely to monopolize a feed cycle.

For each eligible recipient, one database transaction changes the status from **Planned** to **Queued**, records the queued event and inserts a delivery outbox row. The outbox makes the BullMQ delivery job available at the recipient's calculated send time.

A delivery worker must claim the recipient before sending. The claim changes **Queued** to **Dispatching** and creates a two-minute lease. It rechecks the campaign, organization, template and sending profile before contacting the provider. Paused, disabled or otherwise ineligible work is cancelled rather than sent.

The worker also applies several configurable limits:

- BullMQ worker throughput defaults to 60 delivery jobs per minute with concurrency 10.
- Organization delivery defaults to 600 messages per minute.
- Provider delivery defaults to 300 messages per minute.
- Sending-profile delivery defaults to 120 messages per minute.

If a limit or provider circuit is active, the recipient becomes **Retryable** with a future time. It returns through the durable outbox instead of waiting inside a running process.

Immediately before dispatch, NextPhish renders recipient variables, tracking links and the optional tracking pixel. It supplies a stable message ID and idempotency key to the configured mail dispatcher. **Sent** means the sending provider accepted the message; it does not mean the receiving mailbox delivered it. Later provider events, when configured, can add outcomes such as delivered, bounced or rejected.

## Retries and unknown outcomes

Failures are separated by whether another send is known to be safe:

- A setup error before a usable provider result is scheduled for retry with exponential delay and jitter.
- A provider result classified as safely transient or throttled is retried. The default provider-attempt limit is 5; the delay starts around 5 seconds and is capped around 30 minutes, with jitter.
- A permanent provider rejection becomes **Failed**.
- An ambiguous provider result becomes **Delivery unknown** instead of being sent again automatically.
- A recipient left in **Dispatching** after its two-minute lease expires also becomes **Delivery unknown**.

The unknown state is deliberate. For SMTP and other external systems, a timeout can happen after the remote server accepted a message but before NextPhish received the response. Automatically retrying that case could send a duplicate. Operators should investigate the provider logs and recipient timeline before deciding what to do.

BullMQ has its own execution retry policy, separate from recipient delivery attempts: jobs default to five executions with exponential backoff. Database deduplication keys and state transitions prevent a repeated queue execution from blindly repeating completed work. Even with those controls, the system provides durable at-least-once processing with idempotent guards, not universal exactly-once delivery across PostgreSQL, Redis and SMTP.

## Reading delays in the UI

For example, a schedule due at 09:00 does not mean every recipient receives an email at 09:00. The poller first claims the occurrence, materialization prepares the run, and the feeder queues recipients according to the delivery policy. In drip mode, their planned send times are spread out. If Redis is temporarily unavailable during publication, the pending outbox rows remain in PostgreSQL; the publisher can try again once Redis recovers. The browser does not need to stay open throughout this process.

A short delay around a scheduled time can come from the schedule poll interval, outbox poll interval, delivery feeder interval, pacing policy or a rate limit. A longer delay may indicate a stopped worker, unavailable Redis, disabled delivery, a provider circuit, or a failed materialization.

Start with the schedule's timezone and next occurrence. Then inspect the campaign run and recipient timeline. Administrators can use worker logs and execution-health data to distinguish schedule lag, outbox lag, rate deferral and provider failure.

See [Schedules](/app/schedules/) to configure recurrence and pacing, and [Campaigns](/app/campaigns/) to inspect a concrete run.
