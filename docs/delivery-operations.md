# Scheduling and delivery operations

This internal runbook describes the current worker implementation. Read the [execution design](scheduling-and-delivery.md) for transaction boundaries, state transitions and failure windows. The [public guide](../apps/docs/src/content/docs/concepts/scheduling-and-delivery.md) is an introduction, not an operational recovery specification.

## Runtime dependencies and startup

PostgreSQL stores execution state and the transactional outbox. Redis stores BullMQ jobs, periodic schedulers, distributed rate counters and provider circuit state. The worker process must be running; keeping the web application open does not run the scheduler.

The [worker bootstrap](../apps/worker/src/application.ts) validates the message-ID domain and public content URL, then upserts four periodic jobs: schedule polling, outbox publishing, delivery feeding and history maintenance. Configuration and public host validation run before Redis connections or job processing start. A startup failure closes initialized resources and sets a nonzero exit code. Check the `Execution workers started` log and service supervision rather than assuming that a running web server means delivery is healthy. SIGTERM/SIGINT drain workers before closing queues, Redis and the database connection.

The outbox publisher itself is driven by BullMQ. During a Redis outage, PostgreSQL can retain committed pending work, but publishing and Redis-based periodic jobs cannot progress. Recovery also depends on Redis persistence for jobs already acknowledged as published; the outbox is not a backup of the entire Redis queue.

## Configuration reference

These are code defaults, not recommended throughput targets. Restart the worker after changing its environment. Keep limits compatible with the mail provider and deployment capacity. Worker numeric settings must be positive safe integers; invalid values fail startup. `REDIS_PORT` must be at most 65,535 and `OUTBOX_CLAIM_BATCH` at most 500. Concurrency is per process, so multiple replicas multiply the number of simultaneous jobs.

| Environment variable                | Default                        | Meaning                                                            |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| `LOG_LEVEL`                         | `info`                         | Pino level: fatal, error, warn, info, debug, trace or silent       |
| `USER_NOTIFICATIONS_CONCURRENCY`    | `5`                            | Concurrent welcome-email jobs per process                          |
| `JOBS_CONCURRENCY`                  | `5`                            | Concurrent site-import jobs per process                            |
| `IMPORTS_CONCURRENCY`               | `3`                            | Concurrent target-group imports per process                        |
| `SCHEDULE_EXECUTION_CONCURRENCY`    | `1`                            | Concurrent schedule polls per process                              |
| `DELIVERY_FEEDER_CONCURRENCY`       | `1`                            | Concurrent feeder jobs per process                                 |
| `DELIVERY_EVENTS_CONCURRENCY`       | `5`                            | Concurrent delivery-event jobs per process                         |
| `TRACKING_EVENTS_CONCURRENCY`       | `10`                           | Concurrent tracking-event jobs per process                         |
| `OUTBOX_CONCURRENCY`                | `1`                            | Concurrent outbox publish/maintenance jobs per process             |
| `OUTBOX_CLAIM_BATCH`                | `100`                          | Outbox rows claimed per publisher job, maximum 500                 |
| `DELIVERY_ENABLED`                  | Enabled unless exactly `false` | Global delivery claim gate; also check organization/campaign flags |
| `SCHEDULE_POLL_INTERVAL_MS`         | `10000`                        | Periodic schedule claim and expired-lease recovery                 |
| `SCHEDULE_CLAIM_BATCH`              | `50`                           | Requested number of due schedules per claim                        |
| `OUTBOX_POLL_INTERVAL_MS`           | `5000`                         | Outbox publication interval                                        |
| `MATERIALIZATION_CONCURRENCY`       | `2`                            | Concurrent materialization jobs per worker                         |
| `MATERIALIZATION_BATCH_SIZE`        | `250`                          | Recipient snapshot batch size, clamped to 1–1,000                  |
| `DELIVERY_FEED_INTERVAL_MS`         | `10000`                        | Periodic recipient feeder                                          |
| `DELIVERY_HORIZON_MINUTES`          | `5`                            | How far ahead the feeder considers recipients                      |
| `DELIVERY_FEED_BATCH`               | `500`                          | Requested feeder batch size                                        |
| `DELIVERY_CONCURRENCY`              | `10`                           | Concurrent delivery jobs per worker                                |
| `DELIVERY_RATE_MAX`                 | `60`                           | BullMQ delivery queue throughput limit                             |
| `DELIVERY_RATE_DURATION_MS`         | `60000`                        | BullMQ throughput window                                           |
| `ORGANIZATION_DELIVERY_RATE_MAX`    | `600`                          | Organization fixed-window limit per minute                         |
| `PROVIDER_DELIVERY_RATE_MAX`        | `300`                          | Provider-type fixed-window limit per minute                        |
| `PROFILE_DELIVERY_RATE_MAX`         | `120`                          | Sending-profile fixed-window limit per minute                      |
| `DELIVERY_MAX_ATTEMPTS`             | `5`                            | Provider-result retry limit; see design for setup-error behavior   |
| `EXECUTION_MAINTENANCE_INTERVAL_MS` | `86400000`                     | History cleanup interval                                           |
| `DELIVERY_EVENT_RETENTION_DAYS`     | `90`                           | Delivery event retention by creation time                          |
| `DELIVERY_ATTEMPT_RETENTION_DAYS`   | `30`                           | Completed attempt retention                                        |
| `OUTBOX_RETENTION_DAYS`             | `7`                            | Published outbox and processed tracking-inbox retention            |

Source: [worker configuration](../apps/worker/src/config.ts), [processor](../packages/backend/src/delivery/services/delivery-processor.service.ts), [repository](../packages/backend/src/delivery/repositories/delivery.repository.ts).

Not every tuning value is an environment variable. Outbox publishing reclaims claims older than five minutes and delays failed publication by 30 seconds. Recipient dispatch leases last two minutes. BullMQ common job options allow five executions with exponential backoff starting at five seconds. Completed jobs retain up to 5,000 entries for up to one day; failed jobs retain up to 10,000 entries for up to seven days. Job-ID deduplication is consequently bounded by retained queue state.

Distributed counters use Redis Lua `INCR`/`PEXPIRE`, not a sliding window. Provider scope is the provider type, so unrelated profiles using that type share its limit/circuit. Profile scope prefers `sourceSendingProfileId`, so run snapshots share the source profile's limit. All three counters are consumed sequentially, even if an earlier scope is exhausted. Three throttle results within the default 60-second observation window open the provider circuit for 60 seconds. A success clears the throttle counter, not the existing open-circuit key. See [rate limiter](../packages/backend/src/delivery/services/distributed-rate-limiter.service.ts).

## Worker structure and logs

The entry point only starts the application and handles process signals. [Application lifecycle](../apps/worker/src/application.ts), [queue definitions](../apps/worker/src/queues.ts), [periodic schedulers](../apps/worker/src/schedulers.ts) and [worker registration](../apps/worker/src/workers/register-workers.ts) own runtime wiring. Processors are grouped by domain: imports, scheduling, delivery, tracking, notifications and outbox. The [outbox route table](../apps/worker/src/processors/outbox.ts) pairs each topic with its queue and job name; unknown topics fail explicitly and are recorded for retry.

Pino writes structured JSON to stdout. Startup, readiness and shutdown are logged at `info`; failed jobs, worker/queue/Redis errors and failed outbox publications at `error`; stalled jobs at `warn`. Set `LOG_LEVEL=debug` to include job start/completion and successful outbox publication. Worker records include `queue`, with `jobId`, `jobName` and `attemptsMade` for failed jobs. Outbox records include `outboxId`, `topic` and a publisher identifier unique to the process instance. Processors do not log job payloads or results, and the logger redacts common sensitive fields. Error messages and stacks remain available for diagnosis; avoid putting recipient details or credentials into thrown errors.

## Execution-health metrics

`DeliveryRepository.getExecutionOperations(organizationId)` returns organization-scoped diagnostics:

| Field              | Interpretation and caveat                                                      |
| ------------------ | ------------------------------------------------------------------------------ |
| `dueSchedules`     | Enabled scheduled/running schedules whose next occurrence is due               |
| `scheduleLagMs`    | Age of the oldest due next occurrence, clamped to zero                         |
| `pendingOutbox`    | All pending/failed rows, including future `availableAt`; not only overdue work |
| `outboxLagMs`      | Age of the oldest pending/failed `availableAt`, clamped to zero                |
| `deliveryUnknown`  | Recipient count requiring outcome investigation                                |
| `failedRecipients` | Terminal failed-recipient count                                                |
| `occurrenceStates` | Occurrence counts grouped by status                                            |

Publishing outbox rows are excluded from `pendingOutbox` and `outboxLagMs`. A stale publishing claim therefore requires inspecting the table, not just the dashboard count. Provider acceptance, inbox delivery and recipient engagement are separate observations.

## Read-only investigation

Use a read-only database session. In the examples below, bind `$1` to the affected organization ID and `$2` to the recipient ID through your SQL client; the placeholders are parameterized SQL, not literal values to paste into psql. Do not export recipient payloads, SMTP credentials or full tracking URLs into incident logs.

```sql
-- Due or stalled publication, including abandoned publishing claims.
SELECT id, topic, status, "availableAt", "claimedAt", attempts, "lastError"
FROM outbox_event
WHERE "organizationId" = $1
  AND status IN ('PENDING', 'FAILED', 'PUBLISHING')
ORDER BY "availableAt", "createdAt"
LIMIT 100;

-- Dispatch state and lease for the affected recipient.
SELECT id, "campaignId", "deliveryStatus", "scheduledAt", "retryAt",
       "attemptCount", "leaseExpiresAt", "lastError"
FROM campaign_recipient
WHERE "organizationId" = $1 AND id = $2;

-- Attempt outcomes, scoped through the recipient's organization.
SELECT a."attemptNumber", a."startedAt", a."completedAt", a.outcome,
       a."providerMessageId", a."errorCode", a."sanitizedError"
FROM delivery_attempt a
JOIN campaign_recipient r ON r.id = a."campaignRecipientId"
WHERE r."organizationId" = $1 AND r.id = $2
ORDER BY a."attemptNumber";
```

## Triage and recovery

| Symptom                                     | Inspect                                                                                    | Expected behavior / next action                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Due schedules accumulate                    | Worker startup, Redis, `schedule-execution` failed jobs, schedule eligibility and timezone | Restore dependencies; recurring catch-up selects the latest due occurrence, not every missed interval                                                          |
| Pending/failed outbox grows                 | `availableAt`, `lastError`, publisher jobs and topic mapping                               | Fix publication cause; future rows are intentional, failed rows retry after their delay                                                                        |
| Publishing rows stop progressing            | `claimedAt`, worker health                                                                 | Abandoned claims become reclaimable after five minutes; do not clear claims while their owner may still publish                                                |
| Occurrence is failed/materializing too long | Materialization job failure, occurrence error, source availability and snapshot state      | Expired materialization is marked failed; lease recovery alone does not enqueue a replacement job. Inspect retained job and idempotency guards before retrying |
| Planned recipients do not queue             | Campaign/organization eligibility, feeder failures, send horizon                           | Future recipients outside the horizon are expected; restore feeder or eligibility as appropriate                                                               |
| Queued recipients do not dispatch           | Outbox row, retained delivery job, queue pause/rate limiting, Redis persistence            | Published is not equivalent to processed. Missing acknowledged queue jobs need explicit reconciliation; restarting does not replay all published rows          |
| Retryable recipients remain deferred        | Retry time, fixed-window counters, provider circuit, attempts                              | Wait for eligibility or fix the provider/configuration; do not remove limits to mask a provider throttle                                                       |
| Delivery unknown                            | Attempt/provider logs, message ID, dispatch lease and recipient timeline                   | Do not blindly retry or reset the status. Acceptance may already have happened; investigate duplication risk first                                             |
| Sent but not in inbox                       | Provider message ID, spam/quarantine, provider event integration                           | SMTP acceptance is not inbox confirmation; use provider evidence                                                                                               |

Expired dispatch leases are inspected during schedule polling, with up to 500 recipients per recovery call. They become `DELIVERY_UNKNOWN`, not automatically retryable. If schedule polling fails before recovery is reached, lease cleanup is delayed too.

There is no universal replay-all recovery command in this pipeline. Do not turn these diagnostic queries into bulk status updates, delete deduplication rows, or republish all historical outbox events. Queue loss or an ambiguous provider outcome requires a scoped recovery decision after checking durable state and provider evidence.

## Retention and integration boundaries

Maintenance deletes delivery events by `createdAt`, attempts by `completedAt`, processed tracking inbox rows by `processedAt`, and only published outbox rows by `publishedAt`. It does not delete unfinished attempts or pending/failed outbox rows. Preserve relevant diagnostic evidence before the retention window expires.

The `delivery-events` queue's `process-delivery-event` handler currently throws `Delivery event integration is not configured`. Do not interpret that queue's existence as a complete provider integration. Tracking ingestion and provider webhook processing have separate paths; consult the design and provider configuration before diagnosing missing provider events.

Welcome/setup emails use the separate `user-notifications` queue. They do not inherit campaign-recipient leases, delivery limits or campaign outbox guarantees merely because they run in the same process.

## Verification when changing the pipeline

Run the relevant backend tests for recurrence, materialization, pacing, delivery transitions, outbox publication and tracking. Add regression coverage for the failure boundary being changed: duplicate jobs, concurrent claims, crash after enqueue/before acknowledgement, source deletion, a provider timeout after possible acceptance, or Redis loss. Test against isolated services; never validate a retry change by sending to real recipients.

Keep this runbook, the [execution design](scheduling-and-delivery.md), and the public guide in sync when defaults or guarantees change. Public wording should describe observable behavior; internal documentation must retain the actual failure windows and incomplete integrations.
