# Proposal: plugins for NextPhish

Implementation plan: [issue #24](https://github.com/NextPhish/next-phish/issues/24).

Status: proposal for discussion, September 13, 2026. No runtime, configuration or SDK has been implemented. Names and example APIs below are proposed contracts, not existing exports.

## Recommendation

Start with **trusted TypeScript packages included at build time**, with **per-organization activation at runtime**. A JSON configuration defines which installed packages belong to the deployment and which capabilities they receive. Organization administrators can activate only approved plugins. Adding a package requires a new build/deployment; changing organization settings does not require a rebuild.

This supports new pages, dashboard widgets, backend operations and background jobs while retaining Next.js, tRPC and the shared UI component library. The proposed first plugin is **Campaign Summary**: aggregated campaign results, a dedicated page and a small dashboard widget. The first version has no external services, secrets or automatic messaging.

## Existing code

The review covered actual source files, not just the architecture document:

| Existing area                                                       | Extension point                                                                                                                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/backend/src/container.ts`                                 | Domain service registration through TypeDI and a shared MessageBus. The backend is already a separate package; `architecture.md` still shows older locations for some parts. |
| `apps/next-app/src/server/trpc/router.ts`                           | Static root router and `AppRouter` type. Suitable for a generated, typed `plugins` tree.                                                                                     |
| `apps/next-app/src/server/trpc/procedures.ts`                       | Organization context, membership and permissions. Every plugin operation needs a shared plugin guard.                                                                        |
| `apps/next-app/src/components/organisms/app-shell/sidebar-menu.tsx` | Navigation is defined in the component; it can accept validated navigation contributions.                                                                                    |
| `apps/worker/src/index.ts`                                          | BullMQ queues, strict dispatch by job name, retries and graceful shutdown.                                                                                                   |
| `packages/backend/src/delivery/repositories/outbox.repository.ts`   | Transactional outbox with claiming, retries and acknowledgement. It can be extended for plugin events, but current topic mappings are fixed.                                 |
| `packages/database/prisma/schema.prisma`                            | One shared Prisma schema; no existing plugin storage contract.                                                                                                               |

`packages/sdk` is existing unfinished work. It was neither modified nor assumed to be a finished plugin SDK. Before implementation, decide whether a separate `plugin-api` package is appropriate or whether part of that SDK can be reused.

## Configuration and installation

Proposed filename: `next-phish.plugins.json` at the repository root. Use JSON instead of executable TypeScript configuration for the first version: straightforward schema validation, reviewable diffs and no side effects when reading it.

```json
{
  "$schema": "./packages/plugin-api/schemas/deployment.schema.json",
  "configVersion": 1,
  "plugins": [
    {
      "id": "campaign-summary",
      "package": "@next-phish/plugin-campaign-summary",
      "version": "0.1.0",
      "enabled": true,
      "grants": ["campaigns:read-summary"],
      "defaults": {
        "lookbackDays": 30,
        "showDashboardWidget": true
      }
    }
  ]
}
```

`version` is the exact expected package manifest version. Actual resolution and integrity remain in `pnpm-lock.yaml`; configuration does not download npm packages. A local workspace package uses a `workspace:*` dependency, but its manifest must still match the configured `version`.

The developer workflow is: add dependencies to the relevant apps → write the manifest and configuration → run the proposed `pnpm plugins:generate` command → review generated registries → build/test → deploy. Generation must also be a prerequisite of dev/build/typecheck to prevent stale registries. A configuration entry referring to a missing package is an error, not an automatic installation request.

Configuration defines deployment policy: available packages, their maximum grants and default settings. The database separately stores organization activation and permitted overrides. Organization settings cannot expand deployment grants. A plugin is disabled when no organization record exists. Deployment-level `enabled: false` is a global kill switch; changes take effect on deployment/restart, not through an implicit file watcher.

## Plugin structure

```text
packages/plugin-campaign-summary/
  package.json
  plugin.manifest.json
  src/
    contract.ts              # Zod settings, inputs and output DTO schemas
    server.ts                # backend operations, no React imports
    worker.ts                # optional export for jobs/events
    ui/
      index.ts               # client entry, no server imports
      summary/
        index.ts
        summary.tsx
        hooks/
          use-summary.ts
        parts/
          summary-view.tsx
      summary-widget.tsx
      summary.stories.tsx
```

The package declares `./contract`, `./server`, `./ui` and optionally `./worker` exports with corresponding type declarations. React is a peer dependency to avoid loading a second copy. The server entry uses `server-only` in the Next adapter; the worker must not depend on Next.js. The contract package itself must work in all three environments.

```json
{
  "manifestVersion": 1,
  "id": "campaign-summary",
  "version": "0.1.0",
  "hostApi": "^1.0.0",
  "displayName": "Campaign Summary",
  "requestedCapabilities": ["campaigns:read-summary"],
  "contributions": {
    "pages": [{ "id": "overview", "title": "Campaign Summary" }],
    "navigation": [{ "pageId": "overview", "group": "reports", "order": 10 }],
    "widgets": [{ "id": "summary", "slot": "dashboard.secondary" }]
  }
}
```

The manifest contains public metadata only. It contains no JSX, absolute file paths, arbitrary JavaScript URLs or secrets. The generator matches contributions to exports and rejects duplicate identifiers, missing components, unknown slots and incompatible host API versions.

Example backend contract illustrating the proposed API:

```ts
import { z } from "zod";
import { defineServerPlugin } from "@next-phish/plugin-api/server";

export const settingsSchema = z
  .object({
    lookbackDays: z.number().int().min(1).max(90).default(30),
    showDashboardWidget: z.boolean().default(true),
  })
  .strict();

export default defineServerPlugin({
  id: "campaign-summary",
  settingsSchema,
  queries: {
    summary: {
      input: z.object({ days: z.number().int().min(1).max(90) }).strict(),
      output: z.object({
        campaigns: z.number().int().nonnegative(),
        delivered: z.number().int().nonnegative(),
        uniqueClicks: z.number().int().nonnegative(),
      }),
      capabilities: ["campaigns:read-summary"],
      async resolve({ input, ctx }) {
        // The facade is already scoped to the verified organization.
        return ctx.campaigns.getSummary({ days: input.days });
      },
    },
  },
});
```

The host wraps these operations in tRPC, validates input/output and invokes a domain query through a MessageBus adapter. Plugins do not receive PrismaClient, the global Container or the full auth session. Facades are narrow, versioned contracts; DTOs follow existing class-transformer conventions. The host guard resolves organizationId rather than accepting it as an unrestricted facade parameter.

## Next.js, UI and tRPC

Generate three separate registries: public/client, server and worker. The client registry contains only public metadata and statically known imports, for example `dynamic(() => import("@next-phish/plugin-campaign-summary/ui").then(m => m.SummaryPage))`. Never re-export the server registry through a client barrel. This follows the Server/Client Component boundaries in the installed Next.js documentation; lazy loading does not make an arbitrary new npm UI package available after a build. [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)

The host provides one predefined protected route structure, `/extensions/[pluginId]/[[...path]]`, which selects a component from the registry. Organization settings do not generate arbitrary app routes. The page, loader and API check activation and permissions on every request. The database-backed page uses `force-dynamic` and `loading.tsx` according to project conventions. A disabled plugin has an unavailable page and rejects API access; hiding navigation alone is not access control.

For the first version, UI contributions are Client Components receiving a shared `organizationId`, settings DTO and host services; the host route remains a Server Component. Forms follow Formik + Zod and the [component ownership conventions](coding-standards.md#frontend-component-structure); queries use tRPC/React Query. The plugin frontend client is a separate host adapter using contract types, so the package does not import the application's `AppRouter` and create a circular dependency.

The server generator creates statically typed tRPC routers under `plugins.campaignSummary`. Router aliases are generated deterministically; collisions fail the build. A generic `execute(pluginId, method, unknown)` is not proposed as the primary public API because it would lose direct end-to-end type inference. Shared management operations remain in a separate host-owned `plugin` router.

The new UI library provides `PageHeader`, `Card`, `DataTable`, `EmptyState`, `FormField`, tokens and slot boundaries. Navigation descriptors should be data independent of a particular sidebar implementation. Each plugin page/widget has an error boundary and loading/empty/error stories. The component library needs no runtime plugin dependencies, preserving the dependency direction `plugin UI → UI library` without a dependency back to the plugin runtime.

## Backend and worker extensions

Proposed packages: `packages/plugin-api` for contracts and schemas, `packages/plugin-runtime` for registry/settings/activation validation, and host adapters in `next-app` and `worker`. Adapters use `packages/backend`, which does not import plugins. Individual plugin packages depend on the API and UI library, not on `apps/*`.

V1 does not expose hooks that can stop or modify campaign delivery. Start with read queries and UI. Versioned domain events after successful transactions can follow, for example `campaign.completed.v1`; this event is proposed and is not yet defined in the code.

For event-driven extensions, the domain command records the event in the same database transaction as the business change. The outbox publisher sends it to a separate plugin queue instead of running plugin handlers inside HTTP requests or the primary delivery worker. The envelope includes `eventId`, `eventVersion`, `organizationId`, `pluginId`, `pluginVersion`, `activationRevision`, `occurredAt` and a minimal payload containing IDs. The consumer rechecks activation, version, schema and grants, loads permitted data through the facade and records the delivery outcome.

Delivery is at-least-once. A unique database key `(organizationId, pluginId, eventId, handlerId)` and transactional writes protect local effects; a queue jobId alone is insufficient after cleanup. Use an idempotency key for an external service when supported; otherwise, make possible duplication visible and manageable. [BullMQ idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs)

Jobs have bounded concurrency, backoff, a retry budget and dead-letter status. A reporting error must not block the primary delivery queue. Shutdown stops accepting work and waits for started jobs. Lifecycle hooks are per-process `register` (without business side effects), `start` and `dispose`; organization activation is an audited host command, not a callback on every Next.js request. Schedulers register only in the worker and use persistent unique IDs to prevent duplication across replicas.

## Settings, data and security

| Area            | Proposed contract                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versions        | Separate `manifestVersion`, `hostApi`, package version, settings schema version and event payload version. An incompatible plugin stops build/start with a clear message.                                                                                                                                                                         |
| Organizations   | `OrganizationPlugin` with unique `(organizationId, pluginId)`, enabled, settings JSON, schemaVersion, revision, updatedBy/At. State is read server-side; cache keys include both organization and revision.                                                                                                                                       |
| Settings        | Strict Zod validation at startup and on every change; bounded sizes and permitted overrides. Effective settings combine defaults with validated organization overrides.                                                                                                                                                                           |
| Permissions     | Deployment capabilities ∩ organization-permitted capabilities ∩ calling user/API key permissions. Activation/settings require explicit permission to manage organization plugins.                                                                                                                                                                 |
| Background jobs | A host-owned organization service principal with recorded grants, rather than a permanent session belonging to the user who enabled the plugin. Separate audit actor and organization context.                                                                                                                                                    |
| Secrets         | References only, such as `{"provider":"env","key":"REPORT_WEBHOOK_TOKEN"}`, permitted by deployment configuration. Organization users cannot name arbitrary environment variables. Future organization secrets require encryption at rest, rotation and audit. Values never enter manifests, public configuration, logs, jobs or browser bundles. |
| Storage         | The demo is read-only and has no tables of its own. Future small settings/state use host-owned `PluginRecord` with `(organizationId, pluginId, key)`, versioned JSON and quotas. Large datasets require reviewed Prisma migrations in the shared deployment.                                                                                      |
| Migrations      | No DDL on activation. Migrations run once through the deployment pipeline, using expand/contract for rolling deployments. Settings migration includes a dry run and backup.                                                                                                                                                                       |
| Observability   | Structured logs with pluginId, version, orgId and operation/jobId; latency/error counters, last successful run and audit for activation/settings/grants. No target PII in log payloads.                                                                                                                                                           |

Permission tests must explicitly cover both the implicit active organization and an explicitly supplied organizationId: the current helper has different execution paths. The new plugin guard first resolves the organization, then always validates membership and required permissions. UI visibility and manifest declarations cannot replace this check.

**Trusted code has the same trust level as the application itself.** Facades and capabilities define contracts and control access to host APIs; they do not sandbox a malicious npm package in the same Node process. Such code can bypass contracts and access available environment variables, files and network resources. `node:vm` is not a security boundary either. [Node.js VM documentation](https://nodejs.org/api/vm.html)

The first version accepts only reviewed internal/approved packages with a lockfile and controlled dependencies. Supporting unreviewed third-party plugins later requires a separate execution model: an isolated process/container with restricted credentials/network/filesystem and RPC capabilities. Unreviewed UI requires a separate origin and a sandboxed iframe with a validated messaging protocol; ErrorBoundary handling does not isolate malicious JavaScript. This isolation is outside the initial MVP.

The Hono static-server does not load plugins in the first version. Public landing-page delivery remains independent of the authenticated UI and plugin lifecycle.

## First demo: Campaign Summary

The plugin adds Reports → Campaign Summary and a dashboard widget. It shows campaign counts, delivered recipients and unique clicks over 7/30/90 days, with a table grouped by campaign. The backend facade computes aggregates server-side without exposing email addresses, submission contents or arbitrary Prisma filters. Time-window, delivery and unique-click definitions must be agreed against the existing delivery/tracking model before implementation; static design prototype data is not an API contract.

This demo exercises configuration, registry, permissions, organization settings, navigation, shared UI components and tRPC without requiring Slack/email credentials. A small follow-up can add a scheduled aggregate snapshot to exercise worker lifecycle and retries. A Webhook/Slack summary is a suitable second integration plugin once secrets, outbound policy and idempotency contracts are available.

## Phases and acceptance

1. **Contracts and generator.** JSON schemas, package/host compatibility, separate registries and deterministic output. Invalid, missing or duplicate plugins fail before build. Empty configuration preserves existing application behavior.
2. **Activation and guards.** Database migration, host tRPC settings operations, explicit membership/permission validation, audit and kill switch. Negative tests across two organizations, API keys, revoked permissions, disabled plugins and forged organizationId values.
3. **Read-only demo.** Campaign Summary page/widget using the V1 UI library, typed API, Storybook loading/empty/error/mobile states, navigation contribution and output DTO validation. Installed packages can be enabled/disabled without rebuilding.
4. **Worker extension.** Versioned events, outbox adapter, plugin queue, idempotent effects and dead-letter UI. Test retry after a crash, duplicate events, disabling with queued work and incompatible payload versions.
5. **Extended integrations.** Secrets, outbound restrictions, external hooks and potentially separate process isolation. Provider replacement and a runtime marketplace remain outside the first version.

Disabling blocks new plugin requests and scheduling; the worker rechecks the activation revision before applying an effect. An external effect already in progress cannot automatically be undone; run history must reflect this. Existing records remain readable by administrators and are not deleted on disable. Uninstallation is a separate deployment; deleting plugin data is a separate explicit operation. Rolling deployment must support older job payloads until drained or mark them for safe re-execution after upgrading.

The first useful scope is phases 1–3. It can follow the UI library foundation; the library currently needs good composition APIs and navigation descriptors without building the entire plugin runtime in advance.
